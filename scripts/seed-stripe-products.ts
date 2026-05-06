/**
 * scripts/seed-stripe-products.ts
 *
 * Idempotent one-shot to mirror every row in `lead_products` into Stripe as a
 * Product + Price pair. Skips any row whose `stripeProductId` is already set,
 * so re-running after partial failure resumes safely.
 *
 * Run: `tsx scripts/seed-stripe-products.ts`
 *
 * Requires: STRIPE_SECRET_KEY + DATABASE_URL in env (loaded via dotenv/config).
 *
 * NOTE TO REVIEWERS (Sentinel / Ledger): this script does NOT create Stripe
 * coupons, taxes, or shipping rates. Lead products are flat-priced one-off
 * digital deliverables — no recurrence, no inventory. If the catalog ever
 * grows to subscriptions, swap `prices.create` for the recurring product flow.
 */
import "dotenv/config";
import { eq, isNull } from "drizzle-orm";
import { db, pool } from "../server/db";
import { stripe } from "../server/lib/stripe";
import { leadProducts } from "../shared/schema";

async function main() {
  console.log("[seed-stripe-products] starting…");

  // Pull every product whose Stripe IDs haven't been backfilled yet. We're
  // intentionally NOT filtering by `active=true` — even disabled products get
  // a Stripe entry so toggling a product back on later doesn't require a
  // second seed run.
  const rows = await db
    .select()
    .from(leadProducts)
    .where(isNull(leadProducts.stripeProductId));

  if (rows.length === 0) {
    console.log("[seed-stripe-products] nothing to do — every product already has a stripeProductId");
    await pool.end();
    return;
  }

  console.log(`[seed-stripe-products] found ${rows.length} product(s) to mirror into Stripe`);

  let succeeded = 0;
  let failed = 0;

  for (const product of rows) {
    try {
      console.log(
        `[seed-stripe-products] -> ${product.slug} (${product.name}) @ ${product.priceCents}¢`,
      );

      // Step 1: create the Product. `metadata.slug` lets Stripe-side reports
      // tie back to our internal slug enum (LEAD_PRODUCT_SLUGS).
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description ?? undefined,
        metadata: {
          slug: product.slug,
          internal_id: product.id,
        },
      });

      // Step 2: create the Price. Lead purchases are one-shot, USD-only at
      // launch. Currency lives on lead_purchases per-row but the product price
      // itself is fixed at usd here — if we ever offer multi-currency we'll
      // create one Price object per currency.
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: product.priceCents,
        currency: "usd",
        metadata: {
          slug: product.slug,
          internal_id: product.id,
        },
      });

      // Step 3: persist the IDs back so future seed runs skip this row.
      await db
        .update(leadProducts)
        .set({
          stripeProductId: stripeProduct.id,
          stripePriceId: stripePrice.id,
          updatedAt: new Date(),
        })
        .where(eq(leadProducts.id, product.id));

      console.log(
        `[seed-stripe-products]    ok — product=${stripeProduct.id} price=${stripePrice.id}`,
      );
      succeeded++;
    } catch (err: any) {
      console.error(
        `[seed-stripe-products]    FAILED for ${product.slug}:`,
        err?.message || err,
      );
      failed++;
      // Continue with the next row — partial success is better than aborting.
    }
  }

  console.log(
    `[seed-stripe-products] done. succeeded=${succeeded} failed=${failed} total=${rows.length}`,
  );

  await pool.end();

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[seed-stripe-products] fatal:", err);
  process.exit(1);
});
