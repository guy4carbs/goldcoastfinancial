-- Migration 0021: lifeOS Releases
-- Adds the system-update + release-notes data model used by both Gold Coast
-- and Heritage. One release row per shipped lifeOS version; per-user
-- acknowledgements track the popup → reload → notes-viewed lifecycle.
--
-- Idempotent: every CREATE uses IF NOT EXISTS. Re-running this file is a no-op.

BEGIN;

-- =========================================================================
-- 1. lifeos_releases — one row per shipped lifeOS version
-- =========================================================================

CREATE TABLE IF NOT EXISTS lifeos_releases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version         VARCHAR(20) NOT NULL UNIQUE,
  release_type    VARCHAR(10) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  summary         TEXT NOT NULL,
  body_markdown   TEXT NOT NULL,
  highlight_label VARCHAR(20),
  status          VARCHAR(15) NOT NULL DEFAULT 'draft',
  published_at    TIMESTAMP,
  published_by    UUID REFERENCES users(id),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT lifeos_releases_status_chk     CHECK (status IN ('draft','published','archived')),
  CONSTRAINT lifeos_releases_release_type_chk CHECK (release_type IN ('major','minor','patch')),
  CONSTRAINT lifeos_releases_version_chk    CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$')
);

CREATE INDEX IF NOT EXISTS idx_lifeos_releases_published
  ON lifeos_releases(published_at DESC NULLS LAST)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_lifeos_releases_version
  ON lifeos_releases(version);

CREATE INDEX IF NOT EXISTS idx_lifeos_releases_status
  ON lifeos_releases(status);

-- =========================================================================
-- 2. user_release_acks — per-user state per release
-- =========================================================================
-- Composite PK (user_id, release_id, state) lets us record multiple states
-- for the same user×release: e.g. 'update_available_seen' → 'updated' →
-- 'notes_viewed' as separate audit rows. The Provider's "should we show
-- the popup again?" check just looks for the latest 'dismissed' or
-- 'notes_viewed' for that release.

CREATE TABLE IF NOT EXISTS user_release_acks (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  release_id  UUID NOT NULL REFERENCES lifeos_releases(id) ON DELETE CASCADE,
  state       VARCHAR(30) NOT NULL,
  acked_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, release_id, state),
  CONSTRAINT user_release_acks_state_chk
    CHECK (state IN ('update_available_seen','updated','notes_viewed','dismissed'))
);

CREATE INDEX IF NOT EXISTS idx_user_release_acks_user
  ON user_release_acks(user_id);

CREATE INDEX IF NOT EXISTS idx_user_release_acks_release
  ON user_release_acks(release_id);

COMMIT;
