import { DOCUMENT_CONTENT, type DocumentSection } from "@shared/documentContent";

interface Props {
  documentType: "nda" | "debt_rollup" | "compliance";
}

export function DocumentViewer({ documentType }: Props) {
  const doc = DOCUMENT_CONTENT[documentType];
  if (!doc) return null;

  return (
    <div style={{
      maxHeight: 320, overflowY: "auto", padding: "var(--gc-space-4)",
      backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)",
      borderRadius: "var(--gc-radius-sm)", scrollbarWidth: "thin",
    }}>
      <h3 style={{
        fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", fontWeight: 600,
        color: "var(--gc-gold)", letterSpacing: "0.02em", marginBottom: "var(--gc-space-4)",
        textAlign: "center", lineHeight: 1.3,
      }}>{doc.title}</h3>
      {doc.sections.map((s, i) => (
        <div key={i} style={{ marginBottom: "var(--gc-space-3)" }}>
          <h4 style={{
            fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-sm)", fontWeight: 600,
            color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-1)",
          }}>{s.heading}</h4>
          <p style={{
            fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-secondary)", lineHeight: 1.6,
          }}>{s.body}</p>
        </div>
      ))}
    </div>
  );
}
