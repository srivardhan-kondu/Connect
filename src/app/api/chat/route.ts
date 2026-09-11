import Anthropic from "@anthropic-ai/sdk";
import { CHAT_LIMITS, type ChatStreamEvent, type ChatTurn } from "@/lib/chat/protocol";
import { checkRateLimit } from "@/lib/chat/rate-limit";
import { SYSTEM_PROMPT } from "@/lib/chat/system-prompt";

/*
  Streams the CONNECT Assistant's replies to the chat widget. The wire format
  is documented in src/lib/chat/protocol.ts.

  Credentials come from ANTHROPIC_API_KEY (see .env.example); the key never
  reaches the browser because this handler is the only code that uses it.
*/

export const maxDuration = 60;

const MODEL = "claude-opus-5";
// A public endpoint needs a spend ceiling per reply; replies are asked to be
// a few sentences, so this is generous headroom rather than a truncation risk.
const MAX_TOKENS = 4096;
const MAX_BODY_BYTES = 64_000;

const REFUSAL_MESSAGE =
  "I can't help with that one. Try asking something else about CONNECT.";

let client: Anthropic | undefined;
function getClient() {
  client ??= new Anthropic();
  return client;
}

export async function POST(request: Request) {
  if (isCrossOrigin(request)) {
    return jsonError(403, "Requests must come from the CONNECT website.");
  }

  const limit = checkRateLimit(clientKey(request));
  if (!limit.ok) {
    return jsonError(429, "You're sending messages quickly. Please wait a moment and try again.", {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return jsonError(413, "That conversation is too long. Start a new chat and try again.");
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonError(413, "That conversation is too long. Start a new chat and try again.");
  }

  let turns: ChatTurn[] | null = null;
  try {
    turns = parseTurns(JSON.parse(raw));
  } catch {
    // Malformed JSON falls through to the same 400 as an invalid shape.
  }
  if (!turns) {
    return jsonError(400, "That message couldn't be sent. Refresh the page and try again.");
  }

  let stream;
  let events;
  let first;
  try {
    stream = getClient().beta.messages.stream(
      {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        // If a safety classifier declines, the API reruns the request on
        // Anthropic's recommended fallback model instead of refusing outright.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        thinking: { type: "adaptive" },
        // Short conversational answers don't need deep reasoning; low effort
        // keeps the first token fast.
        output_config: { effort: "low" },
        // Two cache breakpoints: the system prompt (identical for every
        // visitor) and, via top-level auto-caching, the growing conversation.
        cache_control: { type: "ephemeral" },
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: turns,
      },
      { signal: request.signal },
    );
    events = stream[Symbol.asyncIterator]();
    // Wait for the first event so auth, rate-limit, and overload errors come
    // back as real HTTP statuses instead of a 200 stream that fails at once.
    first = await events.next();
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    const { status, message } = describeError(error);
    console.error("[chat] request failed:", error);
    return jsonError(status, message);
  }

  const encoder = new TextEncoder();
  let cancelled = false;

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) => {
        if (!cancelled) controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };
      try {
        for (let result = first; !result.done; result = await events.next()) {
          const event = result.value;
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send({ type: "text", text: event.delta.text });
          }
        }
        const message = await stream.finalMessage();
        // "refusal" here means the fallback declined too. Any partial text
        // already streamed must be discarded; the widget does that on "error".
        send(message.stop_reason === "refusal" ? { type: "error", message: REFUSAL_MESSAGE } : { type: "done" });
      } catch (error) {
        if (!cancelled && !request.signal.aborted) {
          console.error("[chat] stream failed:", error);
          send({ type: "error", message: describeError(error).message });
        }
      } finally {
        if (!cancelled) controller.close();
      }
    },
    cancel() {
      cancelled = true;
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      // Stops reverse proxies such as nginx from buffering the stream.
      "X-Accel-Buffering": "no",
    },
  });
}

function parseTurns(body: unknown): ChatTurn[] | null {
  if (!body || typeof body !== "object") return null;
  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > CHAT_LIMITS.maxTurns) {
    return null;
  }

  const turns: ChatTurn[] = [];
  for (const item of messages) {
    if (!item || typeof item !== "object") return null;
    const { role, content } = item as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    const max = role === "user" ? CHAT_LIMITS.maxUserChars : CHAT_LIMITS.maxAssistantChars;
    if (!text || text.length > max) return null;
    turns.push({ role, content: text });
  }

  if (turns[0].role !== "user" || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

function describeError(error: unknown): { status: number; message: string } {
  if (error instanceof Anthropic.RateLimitError) {
    return { status: 429, message: "The assistant is busy right now. Please try again in a minute." };
  }
  if (error instanceof Anthropic.InternalServerError) {
    return { status: 503, message: "The assistant is temporarily unavailable. Please try again shortly." };
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return { status: 502, message: "The assistant couldn't be reached. Please try again." };
  }
  // Authentication, permission, and request-shape errors are configuration
  // problems on our side; the server log has the detail.
  return { status: 503, message: "The assistant isn't available right now. Please try again later." };
}

function isCrossOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function jsonError(status: number, message: string, headers?: HeadersInit) {
  return Response.json({ error: message }, { status, headers });
}
