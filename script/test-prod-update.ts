/**
 * Local production-mode test rig for the lifeOS update mechanism.
 *
 * Stands up a real `npm run build` + `NODE_ENV=production` server on PORT=4000
 * (so your existing dev server on :3000 stays running undisturbed). Then walks
 * through a live version bump → real bundle swap so you can SEE the badge
 * change from 1.0.0 → 1.0.99 in your browser.
 *
 * Sequence:
 *   1. Build with current LIFEOS_VERSION (1.0.0) + boot prod server on :4000
 *   2. You open http://localhost:4000/founders in an incognito window
 *   3. You confirm the badge shows `lifeOS 1.0.0`
 *   4. Script bumps LIFEOS_VERSION to 1.0.99, rebuilds, restarts prod server
 *   5. You wait ≤60s OR refresh — Update Available popup fires
 *   6. You click Update Now — spinner state → reload → badge now reads 1.0.99
 *   7. Script restores LIFEOS_VERSION to 1.0.0 (always — even on Ctrl-C)
 *
 * Run:
 *   npx tsx script/test-prod-update.ts
 *
 * Stop early at any time with Ctrl-C — cleanup runs in the SIGINT handler.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";

const LIFEOS_FILE = path.resolve(__dirname, "..", "shared", "lifeos.ts");
const ORIGINAL_VERSION = "1.0.0";
// Match the already-seeded `1.0.99` release in the DB so the popup label,
// What's-New modal contents, and version badge all stay consistent during
// the demo. (Run `npx tsx scripts/seed-lifeos-test.ts` if 1.0.99 isn't seeded.)
const BUMPED_VERSION = "1.0.99";
const PROD_PORT = "4000";

let prodServer: ChildProcess | null = null;
let originalFileContents: string | null = null;

const rl = createInterface({ input, output });

async function setLifeOSVersion(newVersion: string): Promise<void> {
  const cur = await readFile(LIFEOS_FILE, "utf8");
  if (originalFileContents === null) originalFileContents = cur;
  const replaced = cur.replace(
    /export const LIFEOS_VERSION = "[^"]+";/,
    `export const LIFEOS_VERSION = "${newVersion}";`,
  );
  if (replaced === cur) {
    throw new Error(`Could not find LIFEOS_VERSION line in ${LIFEOS_FILE}`);
  }
  await writeFile(LIFEOS_FILE, replaced, "utf8");
}

async function restoreLifeOSVersion(): Promise<void> {
  if (originalFileContents !== null) {
    await writeFile(LIFEOS_FILE, originalFileContents, "utf8");
    console.log(`✓ Restored ${path.relative(process.cwd(), LIFEOS_FILE)} to LIFEOS_VERSION="${ORIGINAL_VERSION}"`);
    originalFileContents = null;
  }
}

function stopProdServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!prodServer || prodServer.killed) {
      resolve();
      return;
    }
    const child = prodServer;
    child.once("exit", () => resolve());
    child.kill("SIGTERM");
    // Hard kill if it doesn't die in 5s
    setTimeout(() => {
      if (!child.killed) child.kill("SIGKILL");
    }, 5000);
  });
}

function runBuild(): Promise<void> {
  console.log("\n→ Running npm run build…");
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", "build"], {
      cwd: path.resolve(__dirname, ".."),
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) {
        console.log("✓ Build complete");
        resolve();
      } else {
        reject(new Error(`build exited with code ${code}`));
      }
    });
  });
}

function startProdServer(): Promise<void> {
  console.log(`\n→ Starting NODE_ENV=production server on :${PROD_PORT}…`);
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["dist/index.cjs"], {
      cwd: path.resolve(__dirname, ".."),
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: PROD_PORT,
      },
      stdio: ["inherit", "pipe", "pipe"],
    });
    prodServer = child;

    let resolved = false;
    const onReady = () => {
      if (resolved) return;
      resolved = true;
      console.log(`✓ Prod server ready at http://localhost:${PROD_PORT}`);
      resolve();
    };

    child.stdout?.on("data", (chunk) => {
      const s = chunk.toString();
      process.stdout.write(`[prod] ${s}`);
      if (!resolved && /listening|started|ready/i.test(s)) onReady();
    });
    child.stderr?.on("data", (chunk) => {
      process.stderr.write(`[prod] ${chunk.toString()}`);
    });
    child.on("exit", (code) => {
      if (!resolved) {
        reject(new Error(`prod server exited early with code ${code}`));
      }
    });

    // Fallback: assume ready after 8s if we never saw a "listening" log.
    setTimeout(onReady, 8000);
  });
}

async function cleanup(): Promise<void> {
  console.log("\n\nCleaning up…");
  await stopProdServer();
  await restoreLifeOSVersion();
  rl.close();
}

process.on("SIGINT", async () => {
  console.log("\n^C received");
  await cleanup();
  process.exit(130);
});

async function main() {
  console.log("══════════════════════════════════════════════════════════");
  console.log("  lifeOS — local production update rig");
  console.log("══════════════════════════════════════════════════════════");
  console.log("This proves the update mechanism is real. We will:");
  console.log("  1. Build + boot prod server on :4000 with version 1.0.0");
  console.log("  2. You verify the badge reads `lifeOS 1.0.0` in browser");
  console.log("  3. Bump to 1.0.99, rebuild, restart");
  console.log("  4. You click Update Now in the popup");
  console.log("  5. You verify the badge now reads `lifeOS 1.0.99` (proof!)");
  console.log("══════════════════════════════════════════════════════════\n");

  // Phase 1 — build + boot at 1.0.0
  await runBuild();
  await startProdServer();

  console.log("\n┌─ Phase 1: BASELINE ────────────────────────────────────────");
  console.log("│ Open in INCOGNITO (fresh SW state):");
  console.log(`│   http://localhost:${PROD_PORT}/founders`);
  console.log("│");
  console.log("│ Log in (complete 2FA). The badge in the topbar should read:");
  console.log("│   lifeOS 1.0.0");
  console.log("└────────────────────────────────────────────────────────────");
  await rl.question("\nPress Enter when you see the 1.0.0 badge: ");

  // Phase 2 — bump + rebuild + restart at 1.0.99
  console.log("\n→ Bumping LIFEOS_VERSION to 1.0.99…");
  await setLifeOSVersion(BUMPED_VERSION);
  console.log(`✓ shared/lifeos.ts now has LIFEOS_VERSION="${BUMPED_VERSION}"`);

  await stopProdServer();
  await runBuild();
  await startProdServer();

  console.log("\n┌─ Phase 2: UPDATE FIRES ────────────────────────────────────");
  console.log("│ Server is now serving the 1.0.99 bundle. Within ≤60s your");
  console.log("│ browser will poll /api/lifeos/me/status and see");
  console.log("│ update_available=true. The Update Available popup fires.");
  console.log("│");
  console.log("│ (Or refresh /founders to trigger an immediate status poll.)");
  console.log("│");
  console.log("│ When the popup appears: click Update Now.");
  console.log("│   - Spinner shows 'Updating to lifeOS 1.0.99'");
  console.log("│   - SW wipes its cache");
  console.log("│   - Page hard-reloads");
  console.log("│   - Badge now reads: lifeOS 1.0.99 ← THE PROOF");
  console.log("│   - Post-update toast fires");
  console.log("└────────────────────────────────────────────────────────────");
  await rl.question("\nPress Enter once the badge reads 1.0.99: ");

  console.log("\n┌─ Phase 3: VERIFY ──────────────────────────────────────────");
  console.log("│ Optional DevTools checks:");
  console.log("│   - Application → Service Workers: registered at ?v=1.0.99");
  console.log("│   - Application → Cache Storage: only `lifeos-bundle-1.0.99`");
  console.log(`│   - Network → curl -I http://localhost:${PROD_PORT}/`);
  console.log("│     should show Cache-Control: no-cache, no-store, must-revalidate");
  console.log("│   - Bell icon: shows `lifeos.update_complete` row, the");
  console.log("│     `update_available` row is now marked read");
  console.log("└────────────────────────────────────────────────────────────");
  await rl.question("\nPress Enter to clean up and exit: ");

  await cleanup();
  console.log("\n✓ Demo complete. shared/lifeos.ts is back at 1.0.0.");
  console.log("  Your dev server on :3000 was not touched.\n");
  process.exit(0);
}

main().catch(async (err) => {
  console.error("\n✗ Test rig failed:", err?.message ?? err);
  await cleanup();
  process.exit(1);
});
