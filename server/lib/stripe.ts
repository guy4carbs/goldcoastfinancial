/**
 * Singleton Stripe client.
 *
 * The SDK is initialized lazily from `process.env.STRIPE_SECRET_KEY`. Pattern
 * mirrors the project's `bcrypt`-style env-var-missing guards: in production
 * we refuse to construct the client without a key so any caller blows up loudly
 * at boot rather than silently using `undefined` and emitting unauthenticated
 * requests at Stripe's API. In dev we log a warning and export a stub that
 * throws on use, which keeps `tsx` / `vite` boot happy when contributors don't
 * have the Stripe key in their local .env.
 *
 * The webhook signing secret (`STRIPE_WEBHOOK_SECRET`) is read at the call
 * site (server/routes/stripe-webhook.ts) so that key rotations are picked up
 * by a process restart without having to re-instantiate the SDK client.
 */
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Pin the API version so a Stripe-side default bump can't change request /
// response shapes underneath us. Bump this deliberately when reviewing the
// Stripe upgrade guide. Cast through `any` because `apiVersion` is typed as a
// literal union of versions known to the installed SDK; we want to allow
// pinning to a stable version without forcing a SDK upgrade in lockstep.
const STRIPE_API_VERSION = "2024-06-20" as any;

function buildStub(reason: string): Stripe {
  // Proxy that throws on every property access. Lets `import { stripe }`
  // succeed at module-load time but fail loudly the moment something tries to
  // actually call the Stripe API without a key configured.
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      throw new Error(
        `[stripe] Refusing to use Stripe SDK without STRIPE_SECRET_KEY. ` +
          `Property accessed: ${String(prop)}. Reason: ${reason}`,
      );
    },
  };
  return new Proxy({}, handler) as unknown as Stripe;
}

let stripeClient: Stripe;

if (STRIPE_SECRET_KEY) {
  stripeClient = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
    // Tag outgoing requests so they show up cleanly in Stripe's logs.
    appInfo: {
      name: "Heritage Life Solutions",
      url: "https://heritagels.org",
    },
    // Enable automatic retry of network errors. Stripe's SDK already does
    // this for idempotent calls; we add timeout safety on top.
    maxNetworkRetries: 2,
    timeout: 30_000,
  });
} else if (IS_PRODUCTION) {
  // Fail closed in production. Boot will abort here rather than letting the
  // server come up half-wired and silently mis-process payments.
  throw new Error(
    "[stripe] STRIPE_SECRET_KEY is required in production but was not set. " +
      "Refusing to construct Stripe client.",
  );
} else {
  console.warn(
    "[stripe] STRIPE_SECRET_KEY not set — exporting stub client. Any Stripe " +
      "API call will throw until the env var is configured.",
  );
  stripeClient = buildStub("STRIPE_SECRET_KEY env var missing in dev");
}

export const stripe = stripeClient;

// Re-export the Stripe namespace for callers that need event / object types.
// (e.g. `Stripe.Event`, `Stripe.Checkout.Session`) without each route file
// having to import the SDK separately.
export { Stripe };
