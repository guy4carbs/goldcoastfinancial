/**
 * One-shot smoke test for the branded agent-message email template.
 * Run: npx tsx script/test-agent-message-email.ts
 *
 * Dispatches a test email to guy4carbs@gmail.com via the same Gmail helper
 * the admin "Send Message" endpoint uses in production. Safe to delete after
 * verification — this file is not imported by the app.
 */
import "dotenv/config";
import { sendAgentMessageNotification } from "../server/gmail";

async function main() {
  const portalUrl = process.env.AGENT_HCMS_BASE_URL || process.env.APP_BASE_URL || "http://localhost:3000";
  const target = "guy4carbs@gmail.com";

  console.log(`Dispatching test email to ${target}`);
  console.log(`Portal URL: ${portalUrl}`);

  await sendAgentMessageNotification({
    firstName: "Gold Coast Financial Partners",
    email: target,
    title: "Test message from the Gold Coast admin console",
    actionUrl: "/hcms/my/documents",
    portalUrl,
  });

  console.log("✓ Email dispatched via Gmail API");
}

main().catch((err) => {
  console.error("✗ Email dispatch failed:", err?.message || err);
  process.exit(1);
});
