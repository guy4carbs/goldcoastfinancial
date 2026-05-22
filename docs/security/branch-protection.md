# Branch Protection — `main`

**Status:** GitHub-side configuration runbook. Apply once; review yearly.

GitHub → repo **Settings** → **Branches** → **Branch protection rules** →
**Add rule**.

## Branch name pattern

```
main
```

## Required status checks

Wait for the first run of `.github/workflows/security.yml` before adding so
GitHub picks them up:

- ☑ `Security / npm audit (high+critical block)`
- ☑ `Security / tsc`
- ☑ `Security / Secret scan (gitleaks)`
- ☑ Any other CI workflow that becomes relevant (build, e2e, etc.)

Set: **Require branches to be up to date before merging** = ☑.

## Required reviews

- ☑ Require a pull request before merging
- ☑ Require approvals: **1**
- ☑ Dismiss stale pull request approvals when new commits are pushed
- ☑ Require review from Code Owners (once `CODEOWNERS` exists)

## Linear history + signing

- ☑ Require signed commits
- ☑ Require linear history

## Restrict pushes

- ☑ Restrict who can push to matching branches
- Allow only: maintainer team(s), GitHub Apps for releases.

## Force-push + deletion

- ☐ Allow force pushes (leave OFF)
- ☐ Allow deletions (leave OFF)

## Bypass

- ☐ Allow specified actors to bypass required pull requests (leave OFF —
  no one bypasses, including admins, while we're SOC 2-prepping).

---

## Verification

Open a fake PR from a topic branch:

1. Push without GPG/SSH signing → expect "Required commits must be signed"
   blocking the merge button.
2. Push a commit that triggers an `npm audit` high/critical → expect a red
   check on the `npm audit` job and the merge button disabled.
3. Have the second account approve → green merge button if all checks pass.

If a status check is "expected" but never reports (e.g. workflow renamed),
the merge button stays gray forever. Re-add the check name under the rule.
