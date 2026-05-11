import { Component, type ReactNode } from "react";
import { triggerLifeOSUpdate } from "@/lib/lifeos-sw-register";
import { Sparkles } from "lucide-react";

// Vite HMR can throw "Failed to fetch dynamically imported module" when a
// developer's network blips or a module is replaced mid-import — that's
// not a real chunk-404 deploy mismatch, so the Guard short-circuits in dev.
function isDev(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!(import.meta as any).env?.DEV;
  } catch {
    return false;
  }
}

/**
 * ChunkLoadGuard — catches "Failed to load chunk" errors that happen when
 * a user on an old bundle navigates to a route whose JS chunk no longer
 * exists on the server (because we deployed a new bundle and Vite hashed
 * chunks differently). When this happens, the user CANNOT continue in
 * the app until they reload onto the new bundle.
 *
 * Behavior:
 *   - Wraps the entire app router so any lazy-loaded route can throw here.
 *   - Detects chunk-load failures via the standard error fingerprints
 *     ("Loading chunk", "Failed to fetch dynamically imported module",
 *     "Importing a module script failed").
 *   - On detection, replaces the page with a non-dismissable forced
 *     update screen. Single CTA: "Update Now" → triggers SW cache wipe
 *     + reload.
 *
 * Pairs with the lifeOS Service Worker. The SW caches the old bundle so
 * other routes still work; but the moment a chunk-load error fires, we
 * intercept and force the update path.
 */
interface State {
  hit: boolean;
  reloading: boolean;
}

export class ChunkLoadGuard extends Component<{ children: ReactNode }, State> {
  state: State = { hit: false, reloading: false };

  static getDerivedStateFromError(err: unknown): Partial<State> | null {
    const msg = errorMessage(err);
    if (isChunkLoadError(msg)) {
      return { hit: true };
    }
    return null;
  }

  componentDidMount(): void {
    // Catch native chunk-load errors that don't bubble to React (e.g. dynamic
    // import() failures inside event handlers).
    window.addEventListener("unhandledrejection", this.onPromiseRejection);
    window.addEventListener("error", this.onWindowError);
  }

  componentWillUnmount(): void {
    window.removeEventListener("unhandledrejection", this.onPromiseRejection);
    window.removeEventListener("error", this.onWindowError);
  }

  private onPromiseRejection = (e: PromiseRejectionEvent) => {
    const msg = errorMessage(e.reason);
    if (isChunkLoadError(msg)) {
      e.preventDefault();
      this.setState({ hit: true });
    }
  };

  private onWindowError = (e: ErrorEvent) => {
    const msg = errorMessage(e.error ?? e.message);
    if (isChunkLoadError(msg)) {
      e.preventDefault?.();
      this.setState({ hit: true });
    }
  };

  private applyUpdate = async () => {
    if (this.state.reloading) return;
    this.setState({ reloading: true });
    await triggerLifeOSUpdate();
  };

  render(): ReactNode {
    // In dev mode, chunk-load errors are usually HMR noise, not a deploy
    // mismatch. Short-circuit so the Guard never force-screens a developer.
    if (isDev()) return this.props.children;
    if (!this.state.hit) return this.props.children;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lifeos-required-title"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(8, 6, 16, 0.86)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            width: 460,
            maxWidth: "92vw",
            backgroundColor: "var(--gc-surface, #fff)",
            border: "1px solid var(--gc-border, #d8d4cc)",
            borderRadius: "var(--gc-radius-md, 8px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
            padding: "var(--gc-space-6, 24px)",
            animation: "lifeos-required-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "linear-gradient(135deg, var(--gc-gold, #c4975a), var(--gc-gold-bright, #d4a55a))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(196,151,90,0.4)",
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: "var(--gc-ink, #0a0a0a)" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "var(--gc-text-xs, 11px)",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--gc-gold, #c4975a)",
                  fontWeight: 600,
                }}
              >
                Update required
              </div>
              <div
                style={{
                  fontFamily: "var(--gc-font-mono, ui-monospace, monospace)",
                  fontSize: 12,
                  color: "var(--gc-text-muted, #918a7e)",
                  marginTop: 2,
                }}
              >
                lifeOS is ready to load the latest
              </div>
            </div>
          </div>
          <h2
            id="lifeos-required-title"
            style={{
              fontFamily: "var(--gc-font-display, 'Playfair Display', serif)",
              fontSize: 22,
              color: "var(--gc-text-primary, #0a0a0a)",
              margin: 0,
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            This area needs the new lifeOS.
          </h2>
          <p
            style={{
              fontFamily: "var(--gc-font-body, 'Inter', sans-serif)",
              fontSize: "var(--gc-text-md, 14px)",
              color: "var(--gc-text-secondary, #4a4439)",
              lineHeight: 1.5,
              margin: 0,
              marginBottom: 20,
            }}
          >
            A newer version is live and this page can't open on the version you're running. Updating
            is safe — your work, settings, and conversations are preserved.
          </p>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={this.applyUpdate}
              disabled={this.state.reloading}
              style={{
                padding: "10px 26px",
                background: this.state.reloading
                  ? "var(--gc-surface-2, #1a1a1a)"
                  : "linear-gradient(135deg, var(--gc-gold, #c4975a), var(--gc-gold-bright, #d4a55a))",
                color: this.state.reloading
                  ? "var(--gc-text-muted, #918a7e)"
                  : "var(--gc-ink, #0a0a0a)",
                border: "none",
                borderRadius: "var(--gc-radius-sm, 6px)",
                fontFamily: "var(--gc-font-body, 'Inter', sans-serif)",
                fontSize: "var(--gc-text-md, 14px)",
                fontWeight: 600,
                cursor: this.state.reloading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(196,151,90,0.3)",
              }}
            >
              {this.state.reloading ? "Updating…" : "Update Now"}
            </button>
          </div>
        </div>
        <style>{`
          @keyframes lifeos-required-in {
            from { opacity: 0; transform: scale(0.96) translateY(14px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    );
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function isChunkLoadError(msg: string): boolean {
  if (!msg) return false;
  return (
    /Loading chunk \d+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /ChunkLoadError/i.test(msg) ||
    // Vite production chunk load
    /error loading dynamically imported module/i.test(msg) ||
    // Safari variant
    /Unable to load script/i.test(msg)
  );
}
