import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerLifeOSServiceWorker } from "./lib/lifeos-sw-register";

createRoot(document.getElementById("root")!).render(<App />);

// Strict bundle lock — registered after first paint so it doesn't slow
// down initial render. Dev-mode is a no-op (HMR needs fresh fetches).
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    void registerLifeOSServiceWorker();
  });
}
