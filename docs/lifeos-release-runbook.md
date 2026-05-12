# lifeOS — Production release runbook

How to ship a new version of the lifeOS bundle to all live users.

## TL;DR

```bash
# 1. Bump version
# Edit shared/lifeos.ts → LIFEOS_VERSION = "1.0.1"  (semver)

# 2. Author release notes
# /founders/lifeos in Founders Lounge → New release → Save Draft

# 3. Commit + push
git checkout -b release/lifeos-1.0.1
git add shared/lifeos.ts
git commit -m "lifeOS 1.0.1"
git push -u origin release/lifeos-1.0.1
# Open PR, merge to main → Railway auto-deploys

# 4. Purge Cloudflare HTML cache (one-shot until page rule is in place)
# Cloudflare → Caching → Configuration → Purge Everything (or single URLs)

# 5. Publish release notes
# /founders/lifeos → click row → Publish (fans out notifications)

# 6. Verify
# Open https://heritagels.org/founders in incognito → wait ≤60s → popup fires
# Click Update Now → badge shows 1.0.1
```

## Versioning rules (semver)

| Bump | When |
|---|---|
| MAJOR (X.0.0) | Annual flagship redesign or new top-level surface |
| MINOR (0.X.0) | New feature shipped during the year |
| PATCH (0.0.X) | Bug fixes, quality improvements, hotfixes |

`LIFEOS_VERSION` lives at `shared/lifeos.ts`. Both server and client read from it. Vite bakes it into the client bundle at build time via the `__LIFEOS_VERSION__` define (`vite.config.ts:14`).

## What "deploy" actually does

1. Railway runs `npm run build` (= `tsx script/build.ts`):
   - Vite builds the client into `dist/public/` with hashed asset names (`index-<hash>.js`) AND bakes `__LIFEOS_VERSION__ = "X.Y.Z"`
   - esbuild bundles the server into `dist/index.cjs`
2. Railway restarts the process with `npm run start` (runs migrations + boots `node dist/index.cjs`)
3. The server now serves the new bundle from `dist/public/` and reports `deployed_version = X.Y.Z` from `/api/lifeos/me/status`

## What users experience

Every active user has a Service Worker (`/lifeos-sw.js?v=<their_old_version>`) locking them to their cached bundle until they explicitly opt in:

1. Their tab polls `/api/lifeos/me/status` every 60 seconds
2. Server reports `deployed_version` is higher than their `client_version` → `update_available: true`
3. The **Update Available** popup fires
4. The user clicks **Update Now**:
   - Modal transitions to "Updating to lifeOS X.Y.Z" with a spinner
   - `/api/lifeos/me/ack` records `state='updated'` → creates `lifeos.update_complete` notification, marks pending `update_available`/`update_reminder` rows as read
   - The SW receives `LIFEOS_UPDATE` and wipes ALL its caches
   - Page hard-reloads with `?lifeos=<timestamp>` cache-bust
   - Browser fetches new `/index.html` → references the new hashed asset URLs → SW caches the fresh bundle
   - Post-reload: sonner toast fires "Updated to lifeOS X.Y.Z" + What's New modal opens
   - **Version badge in topbar transitions from old → new — visible proof**

5. If they click **Later**: 24h dismissal recorded. The sweeper at `server/services/lifeosNotifications.ts::sweepUpdateReminders` fires a `lifeos.update_reminder` row after 24h IF they still haven't updated.

## Cloudflare cache hazard ⚠

Cloudflare proxies `heritagels.org`. By default, Cloudflare can cache `/index.html` for hours regardless of the origin's `Cache-Control: no-cache` header (especially under the "Cache Everything" page rule).

If Cloudflare serves a stale `index.html` after deploy, users fetch HTML pointing at OLD hashed asset URLs that no longer exist in `dist/public/` → 404s + broken update.

**Mitigation (do this once, then it's automatic):**

Add a Cache Rule in Cloudflare → Caching → Cache Rules:
- **Name**: "Bypass HTML cache"
- **If**: `(http.request.uri.path eq "/") or (ends_with(http.request.uri.path, ".html")) or not (http.request.uri.path contains ".")`
- **Then**: **Cache Eligibility: Bypass cache**

OR add a Page Rule (older Cloudflare UI):
- **URL**: `heritagels.org/*.html`
- **Setting**: Cache Level: Bypass

Static assets (JS/CSS/fonts with hashed filenames) keep their default aggressive cache — those are immutable per-deploy, so caching forever is correct.

**Until the rule is in place**: manually purge the Cloudflare cache after each deploy:
- Cloudflare dashboard → Caching → Configuration → "Purge Everything" (fastest)
- Or purge specific URLs: `https://heritagels.org/`, `https://heritagels.org/index.html`, `https://heritagels.org/lifeos-sw.js`

## Test locally before pushing

Use the prod-mode test rig to verify the update mechanism works end-to-end without touching production:

```bash
npx tsx script/test-prod-update.ts
```

This builds, boots a prod server on :4000 (separate from dev :3000), walks you through a real version bump → real bundle swap, and restores `LIFEOS_VERSION` to its original value when done.

## Notification fan-out

When you click **Publish** on a draft release in `/founders/lifeos`, the server runs `fanoutPublishedNotifications` (see `server/services/lifeosNotifications.ts:46`):

- For every user with `onboarding_status='active'`: insert one of
  - `lifeos.update_available` — if server's `LIFEOS_VERSION < release.version` (i.e. the deploy is behind the notes)
  - `lifeos.notes_published` — if server's `LIFEOS_VERSION >= release.version` (deploy and notes are in sync, no popup needed)
- Idempotent: re-publishing the same release skips users who already have a row

**Common gotcha**: pending/non-active users are skipped from fanout. To seed notifications for a specific user manually:

```bash
npx tsx scripts/seed-lifeos-notifications-for-user.ts <email>
```

## If the deploy goes sideways

- **Users on a busted new bundle**: they can navigate to `/lifeos-sw-kill.js` which is a disaster-recovery SW that unregisters itself + wipes all caches. Next reload pulls a clean slate.
- **Build broken in Railway**: rollback in Railway dashboard (Deployments → previous → Redeploy). The previous bundle's SW is still locked on user machines, so they're insulated — they just don't see the new release until you reship.
- **Notification fan-out blew up**: idempotency check means re-running `publish` is safe. Or insert manually via `seed-lifeos-notifications-for-user.ts`.

## Files involved (for reference)

- `shared/lifeos.ts` — the version constant + version comparison helpers
- `vite.config.ts` — bakes version into client at build time
- `script/build.ts` — full prod build
- `server/static.ts` — serves `dist/public/` with no-cache on HTML + SW
- `server/routes/lifeos.ts` — `/me/status`, `/me/ack`, fanout trigger on publish
- `server/services/lifeosNotifications.ts` — fanout + sweeper helpers
- `client/public/lifeos-sw.js` — strict cache-first lock + LIFEOS_UPDATE handler
- `client/public/lifeos-sw-kill.js` — disaster recovery
- `client/src/lib/lifeos-sw-register.ts` — registers SW in prod only
- `client/src/components/lifeos/LifeOSUpdateProvider.tsx` — root provider, polling, modals
- `client/src/components/lifeos/UpdateAvailableModal.tsx` — Update Now popup
- `client/src/components/lifeos/WhatsNewModal.tsx` — post-update notes
- `client/src/components/lifeos/LifeOSVersionBadge.tsx` — topbar version pill
- `script/test-prod-update.ts` — local end-to-end test rig
