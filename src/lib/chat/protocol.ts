/**
 * The contract between the chat widget and POST /api/chat, imported by both
 * sides so the limits the browser enforces are the limits the server checks.
 *
 * Request:  { messages: ChatTurn[] }  (oldest first, ending with a user turn)
 * Response: newline-delimited JSON, one ChatStreamEvent per line. A normal
 * reply is any number of "text" events followed by "done"; a failure after
 * the stream has opened arrives as a single "error" event instead of "done".
 * Failures before the stream opens are plain JSON { error } with a 4xx/5xx.
 */

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type ChatStreamEvent =
  | { type: "text"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export const CHAT_LIMITS = {
  /** Longest question a visitor can send. */
  maxUserChars: 2000,
  /** Longest earlier reply accepted back as history. */
  maxAssistantChars: 8000,
  /** Most turns sent per request; the widget drops the oldest beyond this. */
  maxTurns: 20,
} as const;
