import { Router, type Request, type Response } from "express";
import { Webhook } from "svix";
import { updateEmailStatusByMessageId, suppress } from "../services/email";

// =============================================================================
// Resend webhook — delivery/engagement/bounce/complaint events.
// =============================================================================
//
// Mounted unauthenticated at /api/webhooks/resend (before auth-gated mounts).
// svix-style signature verification against the raw request body (captured
// globally by server/index.ts → req.rawBody). Mirrors the Telnyx skip-if-unset
// behavior: in production an unset secret refuses processing (500); in non-prod
// it warns and parses the body unverified.
//
// Always responds 200 fast — except a genuine signature failure, which is 400 —
// so Resend does not retry on transient DB errors.

const router = Router();

type ResendEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string | string[];
    bounce?: { message?: string; type?: string; subType?: string };
    [key: string]: any;
  };
};

function firstRecipient(to: string | string[] | undefined): string | null {
  if (!to) return null;
  if (Array.isArray(to)) return to[0] ?? null;
  return to;
}

router.post("/", async (req: Request, res: Response) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const rawBody: Buffer | undefined = (req as any).rawBody;
  const payloadStr = rawBody ? rawBody.toString("utf8") : JSON.stringify(req.body ?? {});

  // 1. Verify signature.
  let event: ResendEvent;
  if (secret) {
    try {
      const wh = new Webhook(secret);
      event = wh.verify(payloadStr, {
        "svix-id": req.headers["svix-id"] as string,
        "svix-timestamp": req.headers["svix-timestamp"] as string,
        "svix-signature": req.headers["svix-signature"] as string,
      }) as ResendEvent;
    } catch (err: any) {
      console.warn("[Resend Webhook] Signature verification failed:", err?.message);
      return res.status(400).json({ error: "Invalid signature" });
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      console.error("[Resend Webhook] RESEND_WEBHOOK_SECRET not set in production — refusing to process.");
      return res.status(500).json({ error: "Webhook not configured" });
    }
    console.warn("[Resend Webhook] RESEND_WEBHOOK_SECRET not set — parsing unverified (non-prod only).");
    try {
      event = JSON.parse(payloadStr) as ResendEvent;
    } catch {
      event = (req.body ?? {}) as ResendEvent;
    }
  }

  // 2. Handle the event. Never throw — DB errors are logged and we still 200.
  try {
    const type = event?.type;
    const data = event?.data ?? {};
    const messageId = data.email_id;
    const recipient = firstRecipient(data.to);

    if (!type || !messageId) {
      return res.status(200).json({ status: "ignored" });
    }

    switch (type) {
      case "email.sent":
        // ensure a status floor of 'sent'; timestamps not tracked for sent.
        await updateEmailStatusByMessageId(messageId, { status: "sent" });
        break;

      case "email.delivered":
        await updateEmailStatusByMessageId(messageId, {
          deliveredAt: new Date(),
          status: "delivered",
        });
        break;

      case "email.opened":
        await updateEmailStatusByMessageId(messageId, {
          openedAt: new Date(),
          status: "opened",
          incrementOpenCount: true,
        });
        break;

      case "email.clicked":
        await updateEmailStatusByMessageId(messageId, {
          clickedAt: new Date(),
          status: "clicked",
          incrementClickCount: true,
        });
        break;

      case "email.bounced": {
        const reason = data.bounce?.message || data.bounce?.type || "bounced";
        await updateEmailStatusByMessageId(messageId, {
          bouncedAt: new Date(),
          bounceReason: reason,
          status: "bounced",
        });
        if (recipient) {
          await suppress(recipient, "bounced", {
            source: "webhook_resend",
            metadata: { event: type, bounce: data.bounce ?? null },
          });
        }
        break;
      }

      case "email.complained": {
        await updateEmailStatusByMessageId(messageId, {
          bouncedAt: new Date(),
          bounceReason: "spam_complaint",
          status: "bounced",
        });
        if (recipient) {
          await suppress(recipient, "complained", {
            source: "webhook_resend",
            metadata: { event: type },
          });
        }
        break;
      }

      default:
        // Unhandled event types (scheduled, delayed, failed, suppressed, etc.)
        // — acknowledge without action.
        break;
    }

    return res.status(200).json({ status: "ok" });
  } catch (err: any) {
    console.error("[Resend Webhook] Processing error (acknowledged anyway):", err?.message);
    return res.status(200).json({ status: "ok" });
  }
});

export default router;
