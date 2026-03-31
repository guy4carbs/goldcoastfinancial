/**
 * Snapchat OAuth / Bitmoji Integration Routes
 * Handles the Snap Kit Login Kit OAuth2 flow to fetch Bitmoji avatars
 */
import { Router, Request, Response } from "express";
import crypto from "crypto";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

const SNAPKIT_CLIENT_ID = process.env.SNAPKIT_CLIENT_ID || "";
const SNAPKIT_CONFIDENTIAL_ID = process.env.SNAPKIT_CONFIDENTIAL_CLIENT_ID || "";
const SNAPKIT_CLIENT_SECRET = process.env.SNAPKIT_CLIENT_SECRET || "";
const SNAP_AUTH_URL = "https://accounts.snapchat.com/accounts/oauth2/auth";
const SNAP_TOKEN_URL = "https://accounts.snapchat.com/accounts/oauth2/token";
const SNAP_PROFILE_URL = "https://kit.snapchat.com/v1/me";

const SCOPES = [
  "https://auth.snapchat.com/oauth2/api/user.display_name",
  "https://auth.snapchat.com/oauth2/api/user.bitmoji.avatar",
  "https://auth.snapchat.com/oauth2/api/user.external_id",
].join(" ");

// In-memory state store (maps state token -> userId) — short-lived, cleaned up on use
const pendingStates = new Map<string, { userId: string; createdAt: number }>();

function getRedirectUri(req: Request): string {
  // Use explicit env var if set (needed when localhost can't register http:// with Snap Kit)
  if (process.env.SNAPKIT_REDIRECT_URI) {
    return process.env.SNAPKIT_REDIRECT_URI;
  }
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${protocol}://${host}/api/auth/snapchat/callback`;
}

// =============================================================================
// GET /api/auth/snapchat — Initiate Snap Kit OAuth flow
// =============================================================================
router.get("/", requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

  if (!SNAPKIT_CLIENT_ID) {
    return res.status(500).json({ success: false, message: "Snap Kit not configured" });
  }

  // Generate state token for CSRF protection
  const state = crypto.randomBytes(32).toString("base64url");
  pendingStates.set(state, { userId, createdAt: Date.now() });

  // Clean up old states (> 10 min)
  const cutoff = Date.now() - 10 * 60 * 1000;
  pendingStates.forEach((val, key) => {
    if (val.createdAt < cutoff) pendingStates.delete(key);
  });

  const redirectUri = getRedirectUri(req);
  const scopeEncoded = encodeURIComponent(SCOPES);
  const redirectEncoded = encodeURIComponent(redirectUri);
  const authUrl = `${SNAP_AUTH_URL}?client_id=${SNAPKIT_CLIENT_ID}&redirect_uri=${redirectEncoded}&response_type=code&scope=${scopeEncoded}&state=${state}`;
  console.log("[SnapKit] Auth redirect URL:", authUrl);
  res.redirect(authUrl);
});

// Helper: send result to opener via postMessage and close popup
function sendPopupResult(res: Response, status: "success" | "error" | "no-avatar") {
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html><html><head><title>Bitmoji</title></head><body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: "bitmoji-auth", status: "${status}" }, window.location.origin);
    window.close();
  } else {
    window.location.href = "/agents/business-card?bitmoji=${status}";
  }
</script>
<p>Connecting Bitmoji... this window should close automatically.</p>
</body></html>`);
}

// =============================================================================
// GET /api/auth/snapchat/callback — Handle OAuth callback
// =============================================================================
router.get("/callback", async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error) {
    console.error("[SnapKit] Auth error:", error);
    return sendPopupResult(res, "error");
  }

  if (!code || !state) {
    return sendPopupResult(res, "error");
  }

  // Validate state
  const pending = pendingStates.get(state as string);
  if (!pending) {
    console.error("[SnapKit] Invalid or expired state token");
    return sendPopupResult(res, "error");
  }
  pendingStates.delete(state as string);
  const userId = pending.userId;

  try {
    // Exchange code for access token
    const redirectUri = getRedirectUri(req);
    const basicAuth = Buffer.from(`${SNAPKIT_CONFIDENTIAL_ID}:${SNAPKIT_CLIENT_SECRET}`).toString("base64");

    const tokenRes = await fetch(SNAP_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: redirectUri,
        client_id: SNAPKIT_CONFIDENTIAL_ID,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("[SnapKit] Token exchange failed:", tokenRes.status, errText);
      return sendPopupResult(res, "error");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("[SnapKit] No access_token in response");
      return sendPopupResult(res, "error");
    }

    // Fetch user profile + Bitmoji avatar
    const profileRes = await fetch(SNAP_PROFILE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: "{me{displayName bitmoji{avatar} externalId}}",
      }),
    });

    if (!profileRes.ok) {
      const errText = await profileRes.text();
      console.error("[SnapKit] Profile fetch failed:", profileRes.status, errText);
      return sendPopupResult(res, "error");
    }

    const profileData = await profileRes.json();
    const bitmojiUrl = profileData?.data?.me?.bitmoji?.avatar;

    if (!bitmojiUrl) {
      console.error("[SnapKit] No Bitmoji avatar found — user may not have one linked");
      return sendPopupResult(res, "no-avatar");
    }

    // Save Bitmoji avatar URL to user's profile
    await pool.query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2::uuid`,
      [bitmojiUrl, userId]
    );

    console.log(`[SnapKit] Bitmoji avatar saved for user ${userId}`);
    return sendPopupResult(res, "success");
  } catch (err: any) {
    console.error("[SnapKit] Callback error:", err?.message);
    return sendPopupResult(res, "error");
  }
});

export default router;
