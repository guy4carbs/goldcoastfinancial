import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@xyflow/react/dist/style.css";
import "@/styles/tour.css";
import { registerLifeOSServiceWorker } from "./lib/lifeos-sw-register";

createRoot(document.getElementById("root")!).render(<App />);

// Strict bundle lock — dev-mode is a no-op so HMR is unaffected.
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    void registerLifeOSServiceWorker();
  });
}
