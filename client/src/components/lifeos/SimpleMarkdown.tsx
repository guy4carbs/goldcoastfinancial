/**
 * SimpleMarkdown — minimal markdown renderer for lifeOS release notes.
 *
 * Author-controlled content (only founders/system_admin write it), so we
 * intentionally support a small, known-safe subset and avoid adding a
 * full library dep to the bundle:
 *
 *   ## Section header        → <h3>
 *   **bold**                 → <strong>
 *   *italic*                 → <em>
 *   `code`                   → <code>
 *   [link](url)              → <a target="_blank" rel="noopener">
 *   - bullet                 → <ul><li>
 *   1. ordered               → <ol><li>
 *   blank line               → paragraph break
 *
 * No raw HTML pass-through, no images, no tables. If we need more we can
 * swap to react-markdown later — the API is the same prop shape.
 */
import { type ReactNode } from "react";

const ESC = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Match http(s) absolute URLs OR a root-relative path that does NOT start
// with `//` (which would be a protocol-relative URL → potential
// cross-origin redirect). Anything else collapses to "#".
const SAFE_URL_RE = /^(https?:\/\/[^/]|\/[^/])/;

function renderInline(line: string): string {
  let out = ESC(line);
  // links
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, txt, url) => {
      // ESC already ran over `url`, but a `"` becoming `&quot;` is still
      // a quote when re-decoded — we keep it escaped in the href
      // attribute to prevent attribute-context escape via fake URLs.
      const safeUrl = SAFE_URL_RE.test(url) ? url : "#";
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--gc-gold, #c4975a); text-decoration: underline;">${txt}</a>`;
    },
  );
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic
  out = out.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, "$1<em>$2</em>$3");
  // inline code
  out = out.replace(/`([^`]+)`/g, '<code style="font-family:var(--gc-font-mono,monospace);background:var(--gc-surface-2,#1a1a1a);padding:1px 6px;border-radius:4px;font-size:0.92em">$1</code>');
  return out;
}

interface BlockProps {
  headerStyle?: React.CSSProperties;
  paragraphStyle?: React.CSSProperties;
  listStyle?: React.CSSProperties;
}

export function SimpleMarkdown({
  source,
  headerStyle,
  paragraphStyle,
  listStyle,
}: { source: string } & BlockProps): ReactNode {
  const lines = source.split(/\r?\n/);
  const blocks: ReactNode[] = [];

  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines (between blocks)
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Header
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const text = h[2];
      blocks.push(
        <h3
          key={key++}
          style={{
            fontFamily: "var(--gc-font-display, Playfair Display, Georgia, serif)",
            fontSize: level === 1 ? 22 : level === 2 ? 18 : 16,
            color: "var(--gc-text-primary)",
            margin: "20px 0 8px",
            fontWeight: 600,
            lineHeight: 1.3,
            ...headerStyle,
          }}
          dangerouslySetInnerHTML={{ __html: renderInline(text) }}
        />,
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul
          key={key++}
          style={{
            margin: "8px 0 12px",
            paddingLeft: 20,
            color: "var(--gc-text-secondary)",
            fontSize: "var(--gc-text-md, 15px)",
            lineHeight: 1.6,
            ...listStyle,
          }}
        >
          {items.map((it, k) => (
            <li
              key={k}
              style={{ marginBottom: 4 }}
              dangerouslySetInnerHTML={{ __html: renderInline(it) }}
            />
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol
          key={key++}
          style={{
            margin: "8px 0 12px",
            paddingLeft: 22,
            color: "var(--gc-text-secondary)",
            fontSize: "var(--gc-text-md, 15px)",
            lineHeight: 1.6,
            ...listStyle,
          }}
        >
          {items.map((it, k) => (
            <li
              key={k}
              style={{ marginBottom: 4 }}
              dangerouslySetInnerHTML={{ __html: renderInline(it) }}
            />
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph (consume contiguous non-blank lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(
        <p
          key={key++}
          style={{
            margin: "0 0 12px",
            color: "var(--gc-text-secondary)",
            fontSize: "var(--gc-text-md, 15px)",
            lineHeight: 1.6,
            ...paragraphStyle,
          }}
          dangerouslySetInnerHTML={{ __html: renderInline(paraLines.join(" ")) }}
        />,
      );
    }
  }

  return <>{blocks}</>;
}
