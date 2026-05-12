import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * ErrorBoundary — root-level React error boundary.
 *
 * P0 (audit 2026-05-12): without this, any render exception in any route
 * crashes the entire app to a white screen. ChunkLoadGuard catches
 * chunk-load failures only — everything else (a thrown TypeError in a
 * page component, a malformed prop, etc.) escapes to React's default
 * behaviour which is to unmount the whole tree.
 *
 * Strategy:
 *   - Catch render-phase exceptions
 *   - Log to console + Sentry (via the global hook if installed)
 *   - Render a minimal fallback with a "Reload" CTA
 *
 * Intentionally framework-light: no Sonner, no GCModal, no design tokens
 * — works even when the design system itself has thrown.
 */
interface State {
  err: Error | null;
  componentStack: string | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { err: null, componentStack: null };

  static getDerivedStateFromError(err: Error): State {
    return { err, componentStack: null };
  }

  componentDidCatch(err: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary] render-time exception:", err, info);
    this.setState({ componentStack: info.componentStack ?? null });
    // Best-effort Sentry forwarding if it's loaded.
    try {
      const w = window as unknown as {
        Sentry?: { captureException?: (e: unknown) => void };
      };
      w.Sentry?.captureException?.(err);
    } catch {
      // ignore
    }
  }

  private reload = () => {
    try {
      window.location.href = window.location.pathname + "?recover=" + Date.now();
    } catch {
      window.location.reload();
    }
  };

  render(): ReactNode {
    const { err } = this.state;
    if (!err) return this.props.children;

    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          backgroundColor: "#FBF7F0",
          color: "#2D1810",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "hsl(348, 65%, 28%)",
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Something went wrong
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28,
              color: "hsl(348, 65%, 22%)",
              fontWeight: 600,
              margin: 0,
              marginBottom: 12,
              lineHeight: 1.2,
            }}
          >
            We hit an unexpected error on this page.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "hsl(348, 20%, 30%)",
              lineHeight: 1.6,
              margin: "0 0 20px",
            }}
          >
            Your work is safe — nothing has been lost. Reload to recover. If this keeps happening, please contact support.
          </p>
          <button
            type="button"
            onClick={this.reload}
            style={{
              padding: "10px 28px",
              backgroundColor: "hsl(348, 65%, 22%)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
          {process.env.NODE_ENV !== "production" && (
            <details
              style={{
                marginTop: 24,
                textAlign: "left",
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                fontSize: 12,
                color: "hsl(348, 20%, 35%)",
                background: "rgba(0,0,0,0.04)",
                padding: 12,
                borderRadius: 6,
                border: "1px solid hsl(348, 30%, 88%)",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                Error details (dev only)
              </summary>
              <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                {String(err?.stack || err?.message || err)}
                {this.state.componentStack ? `\n${this.state.componentStack}` : ""}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
