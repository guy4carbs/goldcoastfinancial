import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
  type LinkTokenCreateRequest,
  type ItemPublicTokenExchangeRequest,
  type TransactionsSyncRequest,
  type ItemRemoveRequest,
} from "plaid";

/**
 * Plaid client — single source of truth for the SDK configuration.
 *
 * Reads `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` from process.env.
 * Throws at boot time if `PLAID_CLIENT_ID` / `PLAID_SECRET` are missing in
 * production; in development the missing-env path returns null so the rest of
 * the app still boots and the routes return a clean "not configured" error.
 */

function resolveBasePath(): string {
  const env = (process.env.PLAID_ENV || "sandbox").toLowerCase();
  if (env === "production") return PlaidEnvironments.production;
  if (env === "development") return PlaidEnvironments.development;
  return PlaidEnvironments.sandbox;
}

let cachedClient: PlaidApi | null = null;

export function getPlaidClient(): PlaidApi | null {
  if (cachedClient) return cachedClient;
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "PLAID_CLIENT_ID and PLAID_SECRET must be set in production. " +
          "Set them in environment or Secrets Manager.",
      );
    }
    return null;
  }
  cachedClient = new PlaidApi(
    new Configuration({
      basePath: resolveBasePath(),
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": clientId,
          "PLAID-SECRET": secret,
          "Plaid-Version": "2020-09-14",
        },
      },
    }),
  );
  return cachedClient;
}

export interface CreateLinkTokenOpts {
  userId: string;
  /** Optional access_token to enter update mode for an existing item. */
  accessToken?: string;
}

/**
 * Create a Plaid Link token for the given founder. Used by the frontend to
 * launch Plaid Link with `transactions` product. The webhook URL is set so
 * Plaid can ping us on SYNC_UPDATES_AVAILABLE.
 */
export async function createLinkToken(opts: CreateLinkTokenOpts) {
  const client = getPlaidClient();
  if (!client) throw new Error("Plaid is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET.");
  const req: LinkTokenCreateRequest = {
    user: { client_user_id: opts.userId },
    client_name: "Gold Coast Financial Partners — Founders Lounge",
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
    access_token: opts.accessToken,
    webhook: process.env.PLAID_WEBHOOK_URL,
  };
  const res = await client.linkTokenCreate(req);
  return res.data;
}

export async function exchangePublicToken(publicToken: string) {
  const client = getPlaidClient();
  if (!client) throw new Error("Plaid is not configured.");
  const req: ItemPublicTokenExchangeRequest = { public_token: publicToken };
  const res = await client.itemPublicTokenExchange(req);
  return res.data; // { access_token, item_id }
}

/**
 * Fetch institution metadata (name, logo) for an Item. Used at exchange time
 * to surface a friendly "Connected: Chase" pill in the UI.
 */
export async function getItemAndInstitution(accessToken: string) {
  const client = getPlaidClient();
  if (!client) throw new Error("Plaid is not configured.");
  const itemRes = await client.itemGet({ access_token: accessToken });
  const institutionId = itemRes.data.item.institution_id;
  let institutionName: string | null = null;
  if (institutionId) {
    try {
      const ins = await client.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
      });
      institutionName = ins.data.institution.name;
    } catch {
      // Non-fatal — fall back to id only.
    }
  }
  return { institutionId, institutionName };
}

/**
 * Sync transactions for a Plaid Item. Cursor-based — pass the previously
 * stored cursor (or undefined to bootstrap), and the API returns added /
 * modified / removed transactions plus a new cursor to persist for next time.
 */
export async function syncTransactions(accessToken: string, cursor?: string | null) {
  const client = getPlaidClient();
  if (!client) throw new Error("Plaid is not configured.");
  const req: TransactionsSyncRequest = {
    access_token: accessToken,
    cursor: cursor ?? undefined,
  };
  const res = await client.transactionsSync(req);
  return res.data; // { added, modified, removed, next_cursor, has_more }
}

export async function removeItem(accessToken: string) {
  const client = getPlaidClient();
  if (!client) throw new Error("Plaid is not configured.");
  const req: ItemRemoveRequest = { access_token: accessToken };
  const res = await client.itemRemove(req);
  return res.data;
}

/**
 * Fetch the JWK Plaid uses to sign webhooks. Cache by `kid` for 24h to avoid
 * hitting this on every webhook.
 */
const verificationKeyCache = new Map<string, { jwk: any; expiresAt: number }>();
const VERIFICATION_KEY_TTL_MS = 24 * 60 * 60 * 1000;

export async function getWebhookVerificationKey(keyId: string): Promise<any> {
  const cached = verificationKeyCache.get(keyId);
  if (cached && cached.expiresAt > Date.now()) return cached.jwk;
  const client = getPlaidClient();
  if (!client) throw new Error("Plaid is not configured.");
  const res = await client.webhookVerificationKeyGet({ key_id: keyId });
  const jwk = res.data.key;
  verificationKeyCache.set(keyId, { jwk, expiresAt: Date.now() + VERIFICATION_KEY_TTL_MS });
  return jwk;
}
