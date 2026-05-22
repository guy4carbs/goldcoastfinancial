# Backup & Restore

**Owner:** Qualified Individual.
**Cadence:** Neon backups continuous; encrypted off-host export weekly;
restore fire-drill quarterly.

This runbook covers point-in-time recovery (PITR) for the production
database, off-host backup retention, and the quarterly restore drill that
proves we can actually recover.

---

## Targets

| Metric | Target | Source |
|--------|--------|--------|
| **RPO** (max data loss) | 5 minutes | Neon continuous archiving |
| **RTO** (max time to restore) | 60 minutes | Hot standby + automated restore script |
| **Off-host retention** | 90 days encrypted snapshots in S3 Object Lock | Weekly cron |
| **Long-term retention** | 7 years cold-tier (legal + GLBA records retention) | Annual S3 Glacier transition |

## What Neon gives us

- **Branching with point-in-time** — every commit on the main branch can
  be restored to any second within the retention window (currently 7 days
  on the Pro plan, 30 days on the Scale plan).
- **Encrypted at rest** — Neon disks use AES-256 with a Neon-managed key.
  Combined with our column-level encryption, a Neon-side leak still
  exposes only the non-encrypted columns.
- **Automatic minor-version upgrades** with zero-downtime restart.

The Neon-managed retention is fine for short-window recovery (an
accidentally-truncated table 30 minutes ago). It's NOT enough for SOC 2
durability or a 7-year retention obligation. We supplement with weekly
off-host snapshots.

## Off-host snapshot procedure

Runs once a week from a GitHub Actions workflow (or cron on a small VM).

### Process

1. Use `pg_dump` to create a compressed custom-format dump:
   ```sh
   pg_dump --format=custom --compress=9 --no-owner --no-privileges \
     "$DATABASE_URL" > /tmp/gc-$(date -u +%Y%m%d).dump
   ```

2. Encrypt the dump with a recipient public key (the Qualified
   Individual holds the private key, kept offline):
   ```sh
   gpg --encrypt --recipient backup@goldcoastfnl.com \
       --output /tmp/gc-$(date -u +%Y%m%d).dump.gpg \
       /tmp/gc-$(date -u +%Y%m%d).dump
   shred -u /tmp/gc-$(date -u +%Y%m%d).dump
   ```

3. Upload to S3 with Object Lock (compliance mode):
   ```sh
   aws s3api put-object \
     --bucket gc-backups-prod \
     --key db/$(date -u +%Y%m)/gc-$(date -u +%Y%m%d).dump.gpg \
     --body /tmp/gc-$(date -u +%Y%m%d).dump.gpg \
     --object-lock-mode COMPLIANCE \
     --object-lock-retain-until-date $(date -u -v+90d +%Y-%m-%dT%H:%M:%SZ)
   shred -u /tmp/gc-$(date -u +%Y%m%d).dump.gpg
   ```

4. Audit-log the upload to `founder_audit_log` via a small helper script.

### Lifecycle

- **0–90 days**: live in S3 Standard, Object Lock COMPLIANCE.
- **90 days–7 years**: S3 Glacier Deep Archive, lock retained.
- **7 years+**: lock expires; lifecycle deletes the object.

### Bucket policy

`gc-backups-prod` should:
- Block public access (Block All Public Access).
- Use bucket-level KMS encryption with a separate CMK from the app's KMS
  key (so a compromise of the app KMS doesn't unlock backups).
- Have versioning enabled.
- Have Object Lock COMPLIANCE retention as the default.

## Restore

### Scenario A — accidental row delete (within Neon's retention window)

1. Open Neon dashboard → **Branches** → **Create branch from time**.
2. Select the timestamp just before the bad write.
3. Connect a one-off psql client to the new branch.
4. Compare the affected table; copy the missing rows back into main with
   `INSERT INTO main_table SELECT ... FROM bad_branch_table WHERE ...`.
5. Audit-log the operation as `audit_restore_partial`.
6. Drop the branch.

### Scenario B — full database loss (Neon outage; restore from off-host)

1. Provision a fresh Neon database (or any Postgres 15+ host).
2. Pull the latest off-host dump from S3:
   ```sh
   aws s3 cp s3://gc-backups-prod/db/$(date -u +%Y%m)/latest.dump.gpg /tmp/
   ```
3. Decrypt with the offline GPG private key (Qualified Individual holds
   it; recovery from physical safe).
4. `pg_restore --no-owner --no-privileges --dbname="$NEW_URL" /tmp/latest.dump`
5. Update `DATABASE_URL` in Secrets Manager.
6. Restart prod servers. Smoke-test: `/api/health`, login, profit-split
   load.
7. Audit-log the operation as `audit_restore_full`.

### Scenario C — point-in-time recovery (corruption discovered hours later)

Same as A, but the bad-branch may contain many tables to merge. Prefer
restoring an entire branch via `ALTER` of the production branch's parent
pointer (Neon CLI: `neonctl branches restore`).

## Quarterly fire-drill checklist

The drill exists to make sure the runbook above actually works. Schedule
on the calendar; rotate the operator each quarter so no single person is
the only one who's ever done it.

- [ ] Pull the most recent off-host dump from S3 to a workstation.
- [ ] Decrypt with GPG. (Verifies the recipient key is still working.)
- [ ] Restore into a fresh Neon branch.
- [ ] Run smoke queries:
  - `SELECT count(*) FROM users;` — should match production roughly.
  - `SELECT count(*) FROM founder_distributions;` — same.
  - Decrypt one Plaid `access_token_encrypted` row in the test branch
    using `decryptFieldUnified`. (Verifies KMS access works for restored
    ciphertext.)
  - Verify the audit chain on the restored copy with
    `verifyAuditChain()`. Expect ok=true.
- [ ] File a fire-drill report: time-to-restore, surprises, fixes.
- [ ] Drop the test branch.

## Failure modes to watch for

- **GPG private key lost**: backups become unrecoverable. Mitigation:
  Shamir's Secret Sharing (3-of-5) of the GPG private key, distributed
  to founders + a safety-deposit box.
- **Backup integrity tampered**: Object Lock COMPLIANCE prevents
  modification, but an attacker with bucket-write could upload a fake
  "latest". Mitigation: pull only objects whose ETag matches the most
  recent upload event in the audit log.
- **KMS key rotated mid-restore**: KMS keeps all key versions internally
  so this works, but if the CMK was DELETED, ciphertext is unrecoverable.
  Mitigation: never delete a CMK with active ciphertext; schedule
  deletion only after all data is re-encrypted under a new CMK.
