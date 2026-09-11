import { Fragment, type ReactNode } from "react";

/*
  Renders the small Markdown subset the assistant is told to use: paragraphs,
  bullet and numbered lists, **bold**, *italic*, `code`, and [links](target).
  Output is built from React elements, never injected HTML, so model text
  can't smuggle markup or scripts into the page.

  Links are limited to in-page hash targets (which the page's router already
  handles, e.g. #join or #/privacy), mailto:, and https:. Anything else
  renders as plain text. Half-streamed syntax such as an unclosed "**" simply
  shows as typed until the closing half arrives.
*/

type Block =
  | { type: "p"; lines: string[] }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

const INLINE = /\*\*(.+?)\*\*|\[([^\]\n]+)\]\(([^)\s]+)\)|`([^`\n]+)`|\*([^*\s][^*\n]*?)\*/g;

export default function ChatMarkdown({ text }: { text: string }) {
  return (
    <>
      {parseBlocks(text).map((block, i) => {
        const key = `b${i}`;
        if (block.type === "p") {
          return (
            <p key={key}>
              {block.lines.map((line, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {renderInline(line, `${key}-${j}`)}
                </Fragment>
              ))}
            </p>
          );
        }
        const List = block.type;
        return (
          <List key={key}>
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item, `${key}-${j}`)}</li>
            ))}
          </List>
        );
      })}
    </>
  );
}

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      current = null;
      continue;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      const item = (bullet ?? numbered)![1];
      if (current && current.type !== "p" && current.type === type) {
        current.items.push(item);
      } else {
        const list: Block = { type, items: [item] };
        blocks.push(list);
        current = list;
      }
      continue;
    }

    // Headings aren't part of the chat's style; show them as a bold line.
    const text = line.replace(/^#{1,6}\s+(.+)$/, "**$1**");
    if (current && current.type === "p") {
      current.lines.push(text);
    } else {
      current = { type: "p", lines: [text] };
      blocks.push(current);
    }
  }

  return blocks;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let n = 0;

  for (const match of text.matchAll(INLINE)) {
    const [whole, bold, label, href, code, italic] = match;
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${n++}`;

    if (bold !== undefined) nodes.push(<strong key={key}>{renderInline(bold, key)}</strong>);
    else if (label !== undefined) nodes.push(renderLink(label, href, key));
    else if (code !== undefined) nodes.push(<code key={key}>{code}</code>);
    else if (italic !== undefined) nodes.push(<em key={key}>{italic}</em>);

    last = match.index + whole.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderLink(label: string, href: string, key: string): ReactNode {
  if (/^#\/?[\w-]*$/.test(href)) {
    return (
      // data-focus-form tells the page's router to focus the waitlist form
      // after scrolling, matching the site's own "Join the Waitlist" buttons.
      <a key={key} href={href} data-focus-form={href === "#join" ? "" : undefined}>
        {label}
      </a>
    );
  }
  if (/^mailto:[^\s@]+@[^\s@]+$/i.test(href)) {
    return (
      <a key={key} href={href}>
        {label}
      </a>
    );
  }
  if (/^https:\/\//i.test(href)) {
    return (
      <a key={key} href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  return <Fragment key={key}>{label}</Fragment>;
}
