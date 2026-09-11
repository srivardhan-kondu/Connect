"use client";

import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Leaf, Logo } from "@/components/IconSprite";
import { CHAT_LIMITS, type ChatStreamEvent, type ChatTurn } from "@/lib/chat/protocol";
import ChatMarkdown from "./ChatMarkdown";
import {
  ArrowDownIcon,
  BackIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  NewChatIcon,
  SendIcon,
  StopIcon,
} from "./icons";

/*
  The CONNECT Assistant: a floating launcher plus a chat panel that streams
  replies from /api/chat. Unlike page.tsx's DOM-driven sections, this is
  ordinary React state, and it only touches the page through links. Hash
  links in replies (#join, #/privacy, ...) are picked up by the page's own
  click router, so the assistant navigates exactly like the site's nav does.

  The panel has two views: "home" (welcome, resume card, suggestions) and
  "chat" (the conversation), with a back button between them. Full-screen on
  phones, each level also gets a history entry, so the system Back gesture
  steps chat -> home -> closed instead of leaving the site.

  Reading flow: sending scrolls the new question to the top of the panel and
  the reply streams in beneath it, so visitors read from the first line
  rather than chasing the bottom. A jump button appears when a reply runs
  past the fold.

  The conversation is kept in sessionStorage so it survives a reload, and is
  gone when the tab closes, as the privacy policy says.
*/

type View = "home" | "chat";

type Message = {
  id: string;
  role: ChatTurn["role"];
  content: string;
  /** True while the reply is still streaming in. */
  pending?: boolean;
};

type ChatError = { message: string; canRetry: boolean };
type ScrollIntent = { to: "bottom" } | { to: "turn"; id: string };
type PendingLink = { href: string; focusForm: boolean };

class ChatRequestError extends Error {
  constructor(
    message: string,
    readonly canRetry = true,
  ) {
    super(message);
  }
}

const STORAGE_KEY = "connect-chat:v1";
const NETWORK_ERROR = "Couldn't reach the assistant. Check your connection and try again.";
const INPUT_MAX_HEIGHT = 132;
/** Matches .chat-scroll's top padding, so a scrolled-to question sits where the first one does. */
const SCROLL_GAP = 16;
/**
 * history.state survives a reload, so entries are tagged with a per-load
 * token; ones left by an earlier load are ignored instead of misread.
 */
const HISTORY_TOKEN = Math.random().toString(36).slice(2);

const SUGGESTIONS = [
  { tone: "gold", text: "What is CONNECT?" },
  { tone: "green", text: "Who is CONNECT for?" },
  { tone: "blue", text: "How do I join the waitlist?" },
  { tone: "red", text: "What happens to my data?" },
] as const;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("home");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [unread, setUnread] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const openRef = useRef(false);
  const restoredRef = useRef(false);
  const wasHomeRef = useRef(true);
  const scrollIntentRef = useRef<ScrollIntent | null>(null);
  const historyDepthRef = useRef(0);
  const pendingLinkRef = useRef<PendingLink | null>(null);

  const onHome = view === "home" || messages.length === 0;
  const overLimit = input.length > CHAT_LIMITS.maxUserChars;
  const canSend = input.trim().length > 0 && !overLimit && !streaming;
  const lastMessage = messages[messages.length - 1];
  const turns = groupTurns(messages);
  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const followUps =
    !streaming && !error && lastMessage?.role === "assistant"
      ? SUGGESTIONS.filter((s) => !asked.has(s.text)).slice(0, 3)
      : [];

  /* ---------- Navigation: open, close, home <-> chat ---------- */
  function pushHistoryEntry(depth: 1 | 2) {
    history.pushState({ connectChat: { token: HISTORY_TOKEN, depth } }, "");
    historyDepthRef.current = depth;
  }

  function openChat() {
    let current = messages;
    // Restore on first open rather than on mount: the server render has no
    // sessionStorage, so reading it during hydration would mismatch.
    if (!restoredRef.current) {
      restoredRef.current = true;
      current = readStoredMessages();
      setMessages(current);
    }
    const nextView: View = current.length ? "chat" : "home";
    setView(nextView);
    setOpen(true);
    setUnread(false);
    scrollIntentRef.current = { to: "bottom" };
    if (isFullScreen()) {
      pushHistoryEntry(1);
      if (nextView === "chat") pushHistoryEntry(2);
    }
  }

  function closeChat(restoreFocus: boolean) {
    setOpen(false);
    if (historyDepthRef.current) history.go(-historyDepthRef.current);
    if (restoreFocus) launcherRef.current?.focus();
  }

  function showChat(scroll: ScrollIntent | null) {
    if (scroll) scrollIntentRef.current = scroll;
    if (view === "chat") return;
    setView("chat");
    if (historyDepthRef.current === 1) pushHistoryEntry(2);
  }

  function showHome() {
    // With a history entry for the chat view, go back through history so the
    // system Back gesture and this button stay in step; the popstate
    // listener below switches the view.
    if (historyDepthRef.current === 2) history.back();
    else setView("home");
  }

  useEffect(() => {
    function onPopState() {
      if (!historyDepthRef.current) return;
      const depth = readHistoryDepth(history.state);
      historyDepthRef.current = depth;
      if (depth === 1) setView("home");
      if (depth !== 0) return;

      setOpen(false);
      const link = pendingLinkRef.current;
      pendingLinkRef.current = null;
      if (link) {
        // Let the page's popstate handling settle, then navigate.
        setTimeout(() => followLink(link));
      } else if (panelRef.current?.contains(document.activeElement)) {
        launcherRef.current?.focus({ preventScroll: true });
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    openRef.current = open;
    document.documentElement.classList.toggle("chat-open", open);
  }, [open]);

  // Move focus into the panel on open, and after a view change removes the
  // focused control (e.g. the back button). Typing in the composer is left
  // alone, since the composer is shared by both views.
  useEffect(() => {
    if (open && !panelRef.current?.contains(document.activeElement)) {
      focusEntryPoint(inputRef.current, titleRef.current);
    }
  }, [open, view]);

  // On phones, size the full-screen panel to the visual viewport so the
  // composer stays above the on-screen keyboard.
  useEffect(() => {
    const vv = window.visualViewport;
    const panel = panelRef.current;
    if (!open || !vv || !panel) return;
    const sync = () => {
      panel.style.setProperty("--chat-vv-height", `${vv.height}px`);
      panel.style.setProperty("--chat-vv-top", `${vv.offsetTop}px`);
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  /* ---------- Persistence ---------- */
  useEffect(() => {
    if (!restoredRef.current || streaming) return;
    try {
      if (messages.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable (private mode, blocked site data); the
      // chat still works for the life of the page.
    }
  }, [messages, streaming]);

  /* ---------- Scrolling & input sizing ---------- */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // The last turn is at least one panel tall (see .chat-turn:last-child),
    // which is what lets a new question scroll all the way to the top.
    el.style.setProperty("--chat-view-h", `${el.clientHeight}px`);

    if (onHome && !wasHomeRef.current) el.scrollTop = 0;
    wasHomeRef.current = onHome;

    const intent = scrollIntentRef.current;
    if (intent && open && !onHome) {
      scrollIntentRef.current = null;
      if (intent.to === "bottom") {
        el.scrollTop = el.scrollHeight;
      } else {
        const turn = el.querySelector<HTMLElement>(`[data-turn="${intent.id}"]`);
        if (turn) {
          el.scrollTo({ top: turn.offsetTop - SCROLL_GAP, behavior: prefersReducedMotion() ? "auto" : "smooth" });
        }
      }
    }
    syncJumpButton(el, jumpRef.current);
  }, [messages, error, open, onHome]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      el.style.setProperty("--chat-view-h", `${el.clientHeight}px`);
      syncJumpButton(el, jumpRef.current);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX_HEIGHT)}px`;
  }, [input]);

  function jumpToLatest() {
    const el = scrollRef.current;
    const end = el?.querySelector<HTMLElement>(".chat-turn:last-child .chat-turn-end");
    if (!el || !end) return;
    el.scrollTo({
      top: end.offsetTop - el.clientHeight + SCROLL_GAP,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  /* ---------- Sending ---------- */
  async function send(conversation: Message[]) {
    const controller = new AbortController();
    abortRef.current = controller;
    const replyId = makeId();
    const updateReply = (patch: Partial<Message>) =>
      setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, ...patch } : m)));

    setMessages([...conversation, { id: replyId, role: "assistant", content: "", pending: true }]);
    setError(null);
    setStreaming(true);
    setAnnouncement("CONNECT Assistant is typing");
    scrollIntentRef.current = { to: "turn", id: conversation[conversation.length - 1].id };

    let reply = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toTurns(conversation) }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new ChatRequestError(data?.error ?? NETWORK_ERROR, res.status !== 400);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as ChatStreamEvent;
          if (event.type === "text") reply += event.text;
          else if (event.type === "done") finished = true;
          else if (event.type === "error") throw new ChatRequestError(event.message);
        }
        updateReply({ content: reply });
      }

      if (!finished) throw new ChatRequestError("The reply was cut off. Please try again.");
      updateReply({ pending: false });
      setAnnouncement(`CONNECT Assistant: ${toPlainText(reply)}`);
    } catch (err) {
      if (controller.signal.aborted) {
        // Stopped by the visitor: keep whatever arrived, drop an empty reply.
        setMessages((prev) =>
          prev.flatMap((m) => (m.id !== replyId ? [m] : m.content ? [{ ...m, pending: false }] : [])),
        );
        setAnnouncement("Reply stopped");
      } else {
        // A failed reply is removed entirely (including partial text), so a
        // retry resends the same question instead of building on a fragment.
        setMessages((prev) => prev.filter((m) => m.id !== replyId));
        const failure =
          err instanceof ChatRequestError
            ? { message: err.message, canRetry: err.canRetry }
            : { message: NETWORK_ERROR, canRetry: true };
        setError(failure);
        setAnnouncement(failure.message);
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setStreaming(false);
      if (!controller.signal.aborted && !openRef.current) setUnread(true);
    }
  }

  function submit(text: string) {
    const content = text.trim();
    if (!content || streaming || content.length > CHAT_LIMITS.maxUserChars) return;
    setInput("");
    showChat(null);
    void send([...messages, { id: makeId(), role: "user", content }]);
  }

  function retry() {
    if (lastMessage?.role === "user" && !streaming) void send(messages);
  }

  function newChat() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setInput("");
    showHome();
    setAnnouncement("Started a new chat");
    focusEntryPoint(inputRef.current, titleRef.current);
  }

  /* ---------- Event handlers ---------- */
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (streaming) abortRef.current?.abort();
    else submit(input);
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit(input);
    }
  }

  function onPanelKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeChat(true);
    }
  }

  function onPanelClick(e: MouseEvent) {
    // A link to part of the page: close the panel so the visitor sees where
    // they landed. The page's router does the navigation.
    const link = (e.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href");
    if (!link || !href?.startsWith("#")) return;
    if (historyDepthRef.current) {
      // Unwind the chat's history entries first and navigate afterwards
      // (see the popstate listener), so Back from the destination returns
      // to the page instead of into a closed chat. React listens on the
      // document, the same node as the page's click router, so only
      // stopImmediatePropagation keeps the router from navigating now.
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();
      pendingLinkRef.current = { href, focusForm: link.hasAttribute("data-focus-form") };
    }
    closeChat(false);
  }

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className="chat-launcher"
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={
          open ? "Close CONNECT Assistant" : unread ? "Open CONNECT Assistant, new reply" : "Open CONNECT Assistant"
        }
        onClick={() => (open ? closeChat(false) : openChat())}
      >
        <span className="chat-launcher-mark" aria-hidden="true">
          {open ? <ChevronDownIcon /> : <Logo />}
        </span>
        <span className="chat-launcher-label" aria-hidden="true">
          Ask CONNECT
        </span>
        {unread && !open && <span className="chat-launcher-badge" aria-hidden="true" />}
      </button>

      <section
        ref={panelRef}
        id="chat-panel"
        className={`chat-panel${open ? " is-open" : ""}`}
        role="dialog"
        aria-labelledby="chat-title"
        inert={!open}
        onKeyDown={onPanelKeyDown}
        onClick={onPanelClick}
      >
        <header className={`chat-head on-dark${onHome ? "" : " has-back"}`}>
          {!onHome && (
            <button type="button" className="chat-icon-btn" onClick={showHome} aria-label="Back to start" title="Back">
              <BackIcon />
            </button>
          )}
          <span className="chat-head-mark" aria-hidden="true">
            <Logo />
          </span>
          <div className="chat-head-text">
            <h2 ref={titleRef} className="chat-title" id="chat-title" tabIndex={-1}>
              CONNECT Assistant
            </h2>
            <p className="chat-status">{streaming ? "Typing…" : "Answers about CONNECT"}</p>
          </div>
          {messages.length > 0 && (
            <button type="button" className="chat-icon-btn" onClick={newChat} aria-label="Start a new chat" title="New chat">
              <NewChatIcon />
            </button>
          )}
          <button type="button" className="chat-icon-btn" onClick={() => closeChat(true)} aria-label="Close chat" title="Close">
            <CloseIcon />
          </button>
        </header>

        <div className="chat-body">
          <div className="chat-scroll" ref={scrollRef} onScroll={() => syncJumpButton(scrollRef.current, jumpRef.current)}>
            {onHome ? (
              <div className="chat-home">
                <p className="chat-welcome-title">Hi, I&apos;m the CONNECT Assistant.</p>
                <p className="chat-welcome-text">
                  Ask me what CONNECT is building, who it&apos;s for, or how to join the waitlist.
                </p>
                {lastMessage && (
                  <button type="button" className="chat-resume" onClick={() => showChat({ to: "bottom" })}>
                    <span className="chat-resume-text">
                      <span className="chat-resume-label">Continue your conversation</span>
                      <span className="chat-resume-preview">
                        {lastMessage.content
                          ? `${lastMessage.role === "user" ? "You: " : ""}${toPlainText(lastMessage.content)}`
                          : "CONNECT Assistant is typing…"}
                      </span>
                    </span>
                    <ChevronRightIcon />
                  </button>
                )}
                <p className="chat-section-label" id="chat-suggestions-label">
                  {lastMessage ? "Or ask something new" : "Popular questions"}
                </p>
                <ul className="chat-suggestions" aria-labelledby="chat-suggestions-label">
                  {SUGGESTIONS.map((s) => (
                    <li key={s.text}>
                      <button type="button" className="chat-suggestion" onClick={() => submit(s.text)} disabled={streaming}>
                        <Leaf className={`c-${s.tone}`} />
                        {s.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="chat-log" aria-label="Conversation">
                {turns.map((turn, i) => {
                  const isLast = i === turns.length - 1;
                  return (
                    <div key={turn.id} className="chat-turn" data-turn={turn.id}>
                      {turn.messages.map((m) =>
                        m.role === "user" ? (
                          <UserMessage key={m.id} content={m.content} />
                        ) : (
                          <AssistantMessage key={m.id} content={m.content} pending={!!m.pending} />
                        ),
                      )}
                      {isLast && error && (
                        <div className="chat-error" role="alert">
                          <span>{error.message}</span>
                          {error.canRetry && lastMessage?.role === "user" && (
                            <button type="button" onClick={retry}>
                              Try again
                            </button>
                          )}
                        </div>
                      )}
                      {isLast && followUps.length > 0 && (
                        <div className="chat-followups" role="group" aria-label="Suggested questions">
                          {followUps.map((s) => (
                            <button key={s.text} type="button" className="chat-chip" onClick={() => submit(s.text)}>
                              <Leaf className={`c-${s.tone}`} />
                              {s.text}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="chat-turn-end" aria-hidden="true" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div ref={jumpRef} className="chat-jump">
            <button type="button" onClick={jumpToLatest} aria-label="Scroll to latest">
              <ArrowDownIcon />
            </button>
          </div>
        </div>

        <form className="chat-form" onSubmit={onSubmit}>
          <div className={`chat-input-wrap${overLimit ? " is-over" : ""}`}>
            <label htmlFor="chat-input" className="sr-only">
              Message the CONNECT Assistant
            </label>
            <textarea
              ref={inputRef}
              id="chat-input"
              className="chat-input"
              rows={1}
              placeholder={onHome ? "Ask about CONNECT…" : "Ask a follow-up…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onInputKeyDown}
              aria-describedby="chat-note"
              aria-invalid={overLimit}
              enterKeyHint="send"
            />
            {streaming ? (
              <button type="submit" className="chat-send is-stop" aria-label="Stop reply">
                <StopIcon />
              </button>
            ) : (
              <button type="submit" className="chat-send" aria-label="Send message" disabled={!canSend}>
                <SendIcon />
              </button>
            )}
          </div>
          <div className="chat-foot">
            <p id="chat-note">
              AI replies can be wrong. Don&apos;t share personal details. <a href="#/privacy">Privacy</a>
            </p>
            {input.length > CHAT_LIMITS.maxUserChars * 0.8 && (
              <p className={`chat-count${overLimit ? " is-over" : ""}`} aria-live="polite">
                {input.length}/{CHAT_LIMITS.maxUserChars}
              </p>
            )}
          </div>
        </form>

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </section>
    </>
  );
}

/* ---------- Messages ---------- */

// Memoized so earlier messages don't re-render on every streamed chunk.
const UserMessage = memo(function UserMessage({ content }: { content: string }) {
  return (
    <div className="chat-msg chat-msg-user">
      <span className="sr-only">You: </span>
      {content}
    </div>
  );
});

const AssistantMessage = memo(function AssistantMessage({ content, pending }: { content: string; pending: boolean }) {
  return (
    <div className="chat-row">
      <span className="chat-avatar" aria-hidden="true">
        <Logo />
      </span>
      <div className={`chat-msg chat-msg-assistant${pending && content ? " is-streaming" : ""}`}>
        <span className="sr-only">CONNECT Assistant: </span>
        {content ? (
          <ChatMarkdown text={content} />
        ) : (
          <span className="chat-typing" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </span>
        )}
      </div>
    </div>
  );
});

/* ---------- Helpers ---------- */

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Each turn is a visitor's question plus the reply to it. */
function groupTurns(messages: Message[]) {
  const turns: { id: string; messages: Message[] }[] = [];
  for (const m of messages) {
    if (m.role === "user" || turns.length === 0) turns.push({ id: m.id, messages: [m] });
    else turns[turns.length - 1].messages.push(m);
  }
  return turns;
}

/** The most recent turns that fit the server's limits, starting with a user turn. */
function toTurns(conversation: Message[]): ChatTurn[] {
  const turns = conversation
    .filter((m) => m.content.trim() && !m.pending)
    .slice(-CHAT_LIMITS.maxTurns)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, m.role === "user" ? CHAT_LIMITS.maxUserChars : CHAT_LIMITS.maxAssistantChars),
    }));
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns;
}

function readStoredMessages(): Message[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Message =>
        !!m &&
        typeof m.id === "string" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        !m.pending,
    );
  } catch {
    return [];
  }
}

function readHistoryDepth(state: unknown): number {
  const entry = (state as { connectChat?: { token?: string; depth?: number } } | null)?.connectChat;
  return entry?.token === HISTORY_TOKEN ? (entry.depth ?? 0) : 0;
}

/** Hands a hash link to the page's document-level click router. */
function followLink({ href, focusForm }: PendingLink) {
  const a = document.createElement("a");
  a.setAttribute("href", href);
  if (focusForm) a.setAttribute("data-focus-form", "");
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
}

/** Shows the jump button only while the latest reply continues below the fold. */
function syncJumpButton(scroll: HTMLElement | null, jump: HTMLElement | null) {
  if (!scroll || !jump) return;
  const end = scroll.querySelector<HTMLElement>(".chat-turn:last-child .chat-turn-end");
  const hiddenBelow = end ? end.offsetTop - (scroll.scrollTop + scroll.clientHeight) : 0;
  jump.hidden = hiddenBelow <= 8;
}

/**
 * Where focus goes when the panel needs it: the composer with a mouse or
 * trackpad, the panel title on touch screens (so the keyboard doesn't cover
 * the content before the visitor asks for it).
 */
function focusEntryPoint(input: HTMLElement | null, title: HTMLElement | null) {
  const target = window.matchMedia("(pointer: fine)").matches ? input : title;
  target?.focus({ preventScroll: true });
}

function isFullScreen() {
  return window.matchMedia("(max-width: 600px)").matches;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function toPlainText(markdown: string) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*`]/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
