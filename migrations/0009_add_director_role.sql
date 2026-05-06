-- Phase D: canonicalize manager → agency_manager, allow new director tier.
-- users.role is varchar with no enum constraint (Vector confirmed) — adding
-- 'director' is purely a TypeScript type change. This migration only fixes
-- the latent bug where 'manager' rows exist but no gate accepts them.

UPDATE users SET role = 'agency_manager' WHERE role = 'manager';
