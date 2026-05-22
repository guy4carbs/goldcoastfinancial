# Cloudflare WAF + Edge Rate Limiting

**Status:** Configuration runbook — operator action required.

This document captures the Cloudflare configuration that should sit in front
of `app.heritagels.org` (and any other production hostname). The app code
ships the in-process rate limits + the security headers; Cloudflare is the
edge layer that catches everything before it reaches the origin.

---

## 1. Provision the zone

1. Log into Cloudflare → **Add a Site** → enter the apex domain.
2. Cloudflare scans existing DNS. Set the records for `app.heritagels.org`
   (and `heritagels.org` if you want to front the marketing site too) to
   **Proxied** (orange cloud).
3. Update nameservers at the registrar to the two Cloudflare ones.
4. Wait for the zone to flip to **Active**.

## 2. SSL/TLS

- **SSL/TLS** → **Overview** → set encryption mode to **Full (strict)**.
- **SSL/TLS** → **Edge Certificates**:
  - **Always Use HTTPS** = On
  - **HTTP Strict Transport Security (HSTS)**: Enable, max-age=12 months,
    Include subdomains, Preload. (Matches the in-app HSTS header.)
  - **Minimum TLS Version** = TLS 1.3
  - **Opportunistic Encryption** = On
  - **TLS 1.3** = On
  - **Automatic HTTPS Rewrites** = On

## 3. Bot management

- **Security** → **Bots** → **Bot Fight Mode** = On (free tier).
- If on a paid plan, switch to **Super Bot Fight Mode** and enable
  **Definitely automated** = Block, **Likely automated** = Managed Challenge.

## 4. WAF rules

In **Security** → **WAF** → **Custom rules**, create the following.

### 4.1 Rate-limit `/api/auth/*`

Equivalent to the per-process express-rate-limit, but at the edge (cheaper +
catches distributed brute-force).

- Name: `auth rate limit`
- Expression: `(http.request.uri.path matches "^/api/auth/(login|2fa)")`
- Action: **Block**
- Rate: **5 requests per 1 minute per IP** (paid plan: per IP+ASN+UA).
- Counting only failed responses requires Cloudflare Pro+ (use response
  status codes 401 and 429 in Advanced Rate Limiting).

### 4.2 Block known-hostile ASNs

- Name: `block tor + datacenter abuse`
- Expression: `(ip.geoip.country in {"CN" "RU" "KP" "IR"} or cf.client.bot)`
  (adjust as needed; this is a conservative starting point)
- Action: **Managed Challenge** (not block — too many false positives).

### 4.3 IP allowlist for `/api/founders/*`

Founder traffic is small and known. Lock the API to office + VPN IPs to
stop opportunistic scanning of the highest-value endpoints.

- Name: `founders only`
- Expression: `(http.request.uri.path matches "^/api/founders/" and not (ip.src in {198.51.100.0/24 203.0.113.42}))`
  (replace placeholders with actual office + VPN egress IPs)
- Action: **Block**

### 4.4 Force traffic through Cloudflare

- Name: `origin only via cf`
- Expression: `(not (cf.edge.server_ip ne ""))`
- Action: **Block**
- Plus on the Hetzner/Railway origin: firewall to accept HTTPS traffic only
  from Cloudflare's IP ranges (https://www.cloudflare.com/ips/).

## 5. Page Rules / Cache

- Cache everything under `/static/*` and `/assets/*` for 1 month.
- **Bypass cache** for everything under `/api/*` (no API response should ever
  be cached at the edge — they contain user-specific data).

## 6. Page Shield (Pro+)

If on Pro or higher, enable **Page Shield** to detect malicious third-party
scripts injected into the SPA. Add an alert to a Slack/email channel.

## 7. Webhook exemption

Cloudflare's Bot Fight Mode can flag legitimate Plaid webhooks. Add an
allowlist rule:

- Name: `plaid webhook bypass`
- Expression: `(http.request.uri.path eq "/api/founders/plaid/webhook" and ip.src in $plaid_ips)`
  (use Plaid's published webhook source IPs — see Plaid docs)
- Action: **Skip** (skip Managed Challenge, Bot Fight Mode, WAF custom rules)

## 8. Logs

- **Analytics & Logs** → **Logs** → enable **HTTP logs** if Pro+ — pipe to
  S3 or a SIEM (Datadog, BetterStack, etc.) for long-term retention.

---

## Verification

After rolling out:

1. `curl -sI https://app.heritagels.org/` → expect `cf-ray:` header.
2. From a non-allowlisted IP, hit `/api/founders/profit/summary` → expect 403
   from the WAF before it reaches the origin.
3. From a curl loop hitting `/api/auth/login` 6× in a minute → expect a
   Cloudflare 429 by attempt 6.
4. From the Plaid sandbox webhook tester → expect a 200 (allowlist worked).
5. SSL Labs (`https://www.ssllabs.com/ssltest/`) → A or A+ grade.

## Future hardening

- Move to **Cloudflare for SaaS** if the product expands to per-customer
  custom domains.
- Add **Cloudflare Access** in front of the founders lounge once SOC 2
  evidence collection is on.
- **Cloudflare Turnstile** on login + signup as a bot challenge alternative
  to reCAPTCHA.
