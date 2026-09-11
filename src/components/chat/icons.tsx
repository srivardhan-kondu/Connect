/* Stroke icons for the chat widget, drawn on a 24px grid in currentColor. */

function Icon({ children, strokeWidth = 2 }: { children: React.ReactNode; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function BackIcon() {
  return (
    <Icon strokeWidth={2.25}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </Icon>
  );
}

export function CloseIcon() {
  return (
    <Icon>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function ChevronDownIcon() {
  return (
    <Icon strokeWidth={2.25}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function ChevronRightIcon() {
  return (
    <Icon strokeWidth={2.25}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}

export function ArrowDownIcon() {
  return (
    <Icon strokeWidth={2.25}>
      <path d="M12 5v14M5 12l7 7 7-7" />
    </Icon>
  );
}

export function NewChatIcon() {
  return (
    <Icon>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z" />
    </Icon>
  );
}

export function SendIcon() {
  return (
    <Icon strokeWidth={2.25}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </Icon>
  );
}

export function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <rect x="7" y="7" width="10" height="10" rx="2" />
    </svg>
  );
}
