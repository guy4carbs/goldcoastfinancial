import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Top-level error boundary — wraps the Router so a single component crash
 * doesn't take down the entire Heritage app with a blank white screen.
 *
 * React's default behavior on an uncaught error inside the tree is to
 * unmount everything below the nearest boundary. With no boundary above
 * <Router />, that means every signed-in user sees a blank page until they
 * hard-refresh. This component catches the error, logs it (and gives us a
 * sourcemap-able stack trace in DevTools), and renders a clean fallback so
 * users at least see a "something went wrong, try again" UI.
 */

interface Props {
  children: ReactNode;
  /** Optional renderable fallback. Defaults to the standard refresh card. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to DevTools console. With sourcemaps enabled in 1.0.59+ the
    // stack trace points to the offending .tsx file:line directly.
    console.error("[ErrorBoundary] caught render error:", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(this.state.error, this.reset);
    }

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "linear-gradient(to bottom right, #f8fafc, #ffffff, rgba(249,250,251,0.5))",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e9d5ff",
            boxShadow: "0 20px 50px rgba(124,58,237,0.18), 0 8px 16px rgba(124,58,237,0.08)",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #7c3aed 0%, #D4AF37 100%)",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            !
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 24,
              fontWeight: 600,
              color: "#111827",
              margin: "0 0 8px",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#374151",
              lineHeight: 1.5,
              margin: "0 0 20px",
            }}
          >
            The page hit an unexpected error. Try again — if it keeps happening, contact{" "}
            <a href="mailto:contact@heritagels.org" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>
              contact@heritagels.org
            </a>
            .
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={this.reset}
              style={{
                padding: "12px 20px",
                background: "linear-gradient(135deg, #7c3aed 0%, #D4AF37 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 20px",
                background: "#ffffff",
                color: "#7c3aed",
                border: "1px solid #e9d5ff",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload page
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre
              style={{
                marginTop: 20,
                padding: 12,
                background: "#f5f3ff",
                borderRadius: 8,
                fontSize: 11,
                color: "#5b21b6",
                overflow: "auto",
                textAlign: "left",
                maxHeight: 160,
              }}
            >
              {this.state.error.stack || this.state.error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
