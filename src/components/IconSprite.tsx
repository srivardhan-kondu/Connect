/**
 * Hidden sprite sheet: defines the CONNECT mark and the leaf glyph once so
 * every <Logo /> / <Leaf /> instance can reference them via <use>, exactly
 * like the original static page.
 */
export default function IconSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
      focusable="false"
    >
      <symbol id="logo" viewBox="0 0 320 320">
        <image href="/logo.webp" width="320" height="320" />
      </symbol>
      <symbol id="leaf" viewBox="0 0 24 24">
        <path
          d="M12 1.5C6.4 5.6 4.2 10.8 5.7 16.6c.7 2.7 3.2 5 6.3 5.9 3.1-.9 5.6-3.2 6.3-5.9C19.8 10.8 17.6 5.6 12 1.5z"
          fill="currentColor"
        />
        <path
          d="M12 6.5v14"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ stroke: "var(--rib,#fff)" }}
        />
      </symbol>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={`logo${className ? ` ${className}` : ""}`}
      viewBox="0 0 320 320"
      aria-hidden="true"
      focusable="false"
    >
      <use href="#logo" />
    </svg>
  );
}

export function Leaf({ className }: { className?: string }) {
  return (
    <svg className={`leaf${className ? ` ${className}` : ""}`} aria-hidden="true">
      <use href="#leaf" />
    </svg>
  );
}
