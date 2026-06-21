/**
 * Discord Notifications (Gold Coast)
 * Subscribes to the founders event bus and posts lead activity to a Discord
 * channel via an incoming webhook. Outbound-only, non-blocking, env-gated.
 *
 * Enabled by setting DISCORD_WEBHOOK_URL. Registered once at boot via
 * initDiscordNotifications(). When unset, the subscriber is not attached.
 *
 * Domain: Conduit (integration).
 */
import { foundersEventBus, type FoundersEvent } from "./foundersEventBus";

type DiscordEmbed = {
  title: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
};

const BLUE = 0x3498db;
const TEAL = 0x1abc9c;

async function post(webhookUrl: string, embed: DiscordEmbed): Promise<void> {
  try {
    const res = await fetch(webhookUrl, {
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

function embedFor(ev: FoundersEvent): DiscordEmbed | null {
  if (ev.type === "lead:new") {
    const { lead } = ev;
    const name = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "New lead";
    const fields = [{ name: "Name", value: name, inline: true }];
    if (lead.email) fields.push({ name: "Email", value: lead.email, inline: true });
    if (lead.source) fields.push({ name: "Source", value: lead.source, inline: true });
    return {
      title: "📋 New Lead",
      color: BLUE,
      fields,
      footer: { text: "Gold Coast Financial • Lead Feed" },
      timestamp: new Date().toISOString(),
    };
  }
  if (ev.type === "lead:distributed") {
    return {
      title: "📦 Leads Distributed",
      color: TEAL,
      fields: [
        { name: "Leads", value: String(ev.leadCount), inline: true },
        { name: "Managers", value: String(ev.managerIds.length), inline: true },
      ],
      footer: { text: "Gold Coast Financial • Lead Feed" },
      timestamp: new Date().toISOString(),
    };
  }
  return null; // other event types are not mirrored to Discord
}

/**
 * Attach the Discord subscriber to the founders event bus. Call once at boot.
 * No-ops (and logs) when DISCORD_WEBHOOK_URL is unset.
 */
export function initDiscordNotifications(): void {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[Discord] DISCORD_WEBHOOK_URL not set — notifications disabled");
    return;
  }
  foundersEventBus.onFounder((ev: FoundersEvent) => {
    const embed = embedFor(ev);
    if (embed) {
      post(webhookUrl, embed).catch((err) =>
        console.warn("[Discord] notification failed:", err?.message),
      );
    }
  });
  console.log("[Discord] lead notifications enabled");
}
