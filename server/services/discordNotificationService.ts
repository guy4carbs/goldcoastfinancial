/**
 * Discord Notification Service
 * Posts production events (new deals/sales) to a Discord channel via an
 * incoming webhook. Outbound-only, non-blocking, env-gated.
 *
 * Enabled by setting DISCORD_WEBHOOK_URL. When unset, every function no-ops
 * so the rest of the app is unaffected.
 *
 * Domain: Conduit (integration) — does NOT touch commission math (Ledger).
 */

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

type DiscordEmbed = {
  title: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
};

const GREEN = 0x2ecc71;

function money(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

/** Fire-and-forget POST to the Discord webhook. Never throws. */
async function post(embed: DiscordEmbed): Promise<void> {
  if (!WEBHOOK_URL) return; // notifications disabled
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!res.ok) {
      console.warn(`[Discord] webhook returned ${res.status}`);
    }
  } catch (err: any) {
    console.warn("[Discord] notification failed:", err?.message);
  }
}

/** Notify a new deal/sale submission. Call fire-and-forget (don't await). */
export async function notifyNewSale(params: {
  agentName: string;
  carrier: string;
  monthlyPremium: number;
  annualPremium: number;
  clientName?: string | null;
  productType?: string | null;
}): Promise<void> {
  const fields = [
    { name: "Agent", value: params.agentName || "Agent", inline: true },
    { name: "Carrier", value: params.carrier || "—", inline: true },
    { name: "Annual Premium", value: money(params.annualPremium), inline: true },
    { name: "Monthly", value: money(params.monthlyPremium), inline: true },
  ];
  if (params.productType) {
    fields.push({ name: "Product", value: params.productType, inline: true });
  }
  if (params.clientName) {
    fields.push({ name: "Client", value: params.clientName, inline: true });
  }
  await post({
    title: "💰 New Deal Submitted",
    color: GREEN,
    fields,
    footer: { text: "Heritage Life • Production Feed" },
    timestamp: new Date().toISOString(),
  });
}
