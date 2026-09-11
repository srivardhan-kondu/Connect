/**
 * Per-visitor request limits for /api/chat, so one visitor (or a script)
 * can't run up the Anthropic bill.
 *
 * State lives in this server instance's memory: it resets on restart and
 * isn't shared between instances. That is enough for a single Node server
 * and still blunts abuse on serverless, but for strict limits across many
 * instances, move this to a shared store such as Redis.
 */

const WINDOWS = [
  { ms: 60_000, max: 10 },
  { ms: 60 * 60_000, max: 60 },
] as const;

const LONGEST_WINDOW_MS = Math.max(...WINDOWS.map((w) => w.ms));
const PRUNE_THRESHOLD = 5_000;

const hits = new Map<string, number[]>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < LONGEST_WINDOW_MS);

  for (const { ms, max } of WINDOWS) {
    const inWindow = recent.filter((t) => now - t < ms);
    if (inWindow.length >= max) {
      hits.set(key, recent);
      return { ok: false, retryAfterSeconds: Math.ceil((inWindow[0] + ms - now) / 1000) };
    }
  }

  recent.push(now);
  hits.set(key, recent);
  if (hits.size > PRUNE_THRESHOLD) prune(now);
  return { ok: true };
}

function prune(now: number) {
  for (const [key, times] of hits) {
    if (now - times[times.length - 1] >= LONGEST_WINDOW_MS) hits.delete(key);
  }
}
