// lifeOS recovery script — paired with /lifeos-recover.html.
// Wipes every Service Worker registration and Cache API namespace owned by
// this origin, then hard-reloads with a cache-busting query string. Used
// when a user is stuck on a bundle whose update flow is broken.
//
// Kept as an external file (not inline in the HTML) because the global
// helmet CSP is `script-src 'self'` — inline scripts are blocked. The
// /lifeos-recover/* prefix is in the SW's NETWORK_ONLY list so this file
// always loads fresh from the network.
(function () {
  var btn = document.getElementById("reset");
  var status = document.getElementById("status");
  var log = document.getElementById("log");
  if (!btn || !status || !log) return;
  var lines = [];

  function setStatus(html, cls) {
    status.innerHTML = '<span>Status</span><strong class="' + (cls || "") + '">' + html + "</strong>";
  }
  function tee(line) {
    lines.push(line);
    log.hidden = false;
    log.textContent = lines.join("\n");
  }

  async function reset() {
    btn.disabled = true;
    setStatus("Working...");
    try {
      if ("serviceWorker" in navigator) {
        var regs = await navigator.serviceWorker.getRegistrations();
        tee("Found " + regs.length + " service worker(s).");
        for (var i = 0; i < regs.length; i++) {
          var reg = regs[i];
          try {
            if (reg.active) {
              reg.active.postMessage({ type: "LIFEOS_UPDATE" });
            }
            await reg.unregister();
            tee("Unregistered: " + (reg.scope || "(scope?)"));
          } catch (err) {
            tee("Unregister failed: " + (err && err.message ? err.message : err));
          }
        }
      } else {
        tee("Browser has no Service Worker support — proceeding to cache wipe.");
      }

      if ("caches" in window) {
        var names = await caches.keys();
        tee("Found " + names.length + " cache namespace(s).");
        for (var j = 0; j < names.length; j++) {
          var name = names[j];
          try {
            await caches.delete(name);
            tee("Deleted cache: " + name);
          } catch (err) {
            tee("Cache delete failed: " + name + " :: " + (err && err.message ? err.message : err));
          }
        }
      }

      setStatus("Done. Reloading...", "success");
      setTimeout(function () {
        var ts = Date.now();
        window.location.replace("/?lifeos_recovered=" + ts);
      }, 800);
    } catch (err) {
      setStatus("Reset failed. Try clearing site data in your browser settings.", "error");
      tee("Top-level error: " + (err && err.message ? err.message : err));
      btn.disabled = false;
    }
  }

  btn.addEventListener("click", reset);
})();
