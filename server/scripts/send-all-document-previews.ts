/**
 * Send all 17 document PDF previews to a specified email address.
 * Usage: npx tsx server/scripts/send-all-document-previews.ts
 */

import { generateDocument } from "../services/documentGeneratorService";
import { sendEmailWithAttachments } from "../gmail";
import type { AgentInfo, ClientInfo, PolicyInfo, ClaimInfo } from "../services/documentGeneratorService";

const TARGET_EMAIL = "guy4carbs@gmail.com";

const sampleClient: ClientInfo = {
  firstName: "Ben",
  lastName: "Dover",
  email: "ben@example.com",
  phone: "(630) 555-1234",
};

const sampleAgent: AgentInfo = {
  name: "Guy Carbs",
  email: "admin@heritagels.org",
  phone: "(630) 478-1835",
  npn: "22128144",
};

const samplePolicy: PolicyInfo = {
  policyNumber: "HLS-2026-10042",
  type: "Indexed Universal Life (IUL)",
  carrier: "Americo",
  carrierId: "americo",
  coverageAmount: 500000,
  monthlyPremium: 450,
  startDate: "2025-04-09T00:00:00Z",
  nextPaymentDate: "2026-04-16T00:00:00Z",
  status: "active",
  beneficiaries: [
    { name: "Lisa Dover", relationship: "Spouse", percentage: 70 },
    { name: "James Dover", relationship: "Child", percentage: 30 },
  ],
  beneficiaryName: "Lisa Dover",
  beneficiaryRelationship: "Spouse",
  cashValue: 18400,
};

const sampleClaim: ClaimInfo = {
  claimNumber: "CLM-2026-00413",
  filedDate: "2026-03-15T00:00:00Z",
  type: "Living Benefits",
  status: "approved",
  amount: 125000,
  denialReason: "Policy exclusion for pre-existing conditions within the contestability period.",
};

const ALL_TEMPLATES = [
  "welcome_letter",
  "policy_summary",
  "claims_guide",
  "beneficiary_designation_confirmation",
  "portal_access_instructions",
  "annual_policy_statement",
  "premium_payment_reminder",
  "policy_anniversary_letter",
  "annual_review_invitation",
  "claims_packet",
  "claim_acknowledgment",
  "claim_status_update",
  "claim_approval_letter",
  "claim_denial_letter",
  "beneficiary_change_confirmation",
  "contact_update_confirmation",
  "payment_method_update_confirmation",
];

async function main() {
  console.log(`Generating all 17 document PDFs and sending to ${TARGET_EMAIL}...`);

  const pdfs: Array<{ filename: string; content: Buffer; contentType: string }> = [];

  for (const key of ALL_TEMPLATES) {
    try {
      console.log(`  Generating: ${key}...`);
      const buffer = await generateDocument({
        templateKey: key,
        client: sampleClient,
        agent: sampleAgent,
        policy: samplePolicy,
        claim: key.includes("claim") ? sampleClaim : undefined,
        personalNote: key.includes("anniversary") || key.includes("review") || key.includes("status_update")
          ? "It has been a pleasure working with you this past year. I look forward to continuing to help you protect what matters most."
          : undefined,
        additionalData: key === "beneficiary_change_confirmation"
          ? { previousBeneficiaries: [{ name: "Sarah Mitchell", relationship: "Spouse", percentage: 100 }] }
          : key === "contact_update_confirmation"
          ? { updatedFields: { phone: "(630) 555-9999", email: "ben.new@example.com" } }
          : key === "payment_method_update_confirmation"
          ? { newMethod: "Bank of America Checking ****7890", applicablePolicies: ["HLS-2026-10042"] }
          : undefined,
      });

      const cleanName = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      pdfs.push({
        filename: `${cleanName}.pdf`,
        content: buffer,
        contentType: "application/pdf",
      });
      console.log(`  ✓ ${cleanName} (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (err: any) {
      console.error(`  ✗ ${key}: ${err.message}`);
    }
  }

  console.log(`\nGenerated ${pdfs.length}/${ALL_TEMPLATES.length} PDFs. Sending email...`);

  // Send in batches of 5 to avoid Gmail size limits
  const batchSize = 5;
  for (let i = 0; i < pdfs.length; i += batchSize) {
    const batch = pdfs.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(pdfs.length / batchSize);

    try {
      await sendEmailWithAttachments({
        to: TARGET_EMAIL,
        subject: `Heritage Document Previews (Batch ${batchNum}/${totalBatches}) — ${batch.map((p) => p.filename.replace(".pdf", "")).join(", ")}`,
        htmlBody: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#3b1f7e;margin:0 0 16px;">Document Preview — Batch ${batchNum} of ${totalBatches}</h2>
            <p style="color:#374151;line-height:1.6;">Attached are ${batch.length} Heritage Life Solutions document PDFs for your review:</p>
            <ul style="color:#374151;line-height:2;">
              ${batch.map((p) => `<li><strong>${p.filename}</strong> (${(p.content.length / 1024).toFixed(0)} KB)</li>`).join("")}
            </ul>
            <p style="color:#6b7280;font-size:13px;margin-top:24px;">These are preview documents generated with sample data (Ben Dover, Americo IUL policy). Review the branding, layout, and content.</p>
          </div>
        `,
        plainTextBody: `Heritage Document Previews — Batch ${batchNum}/${totalBatches}\n\n${batch.map((p) => `- ${p.filename}`).join("\n")}\n\nReview the attached PDFs for branding, layout, and content.`,
        attachments: batch,
      });
      console.log(`✓ Batch ${batchNum}/${totalBatches} sent (${batch.length} PDFs)`);
    } catch (err: any) {
      console.error(`✗ Batch ${batchNum} failed: ${err.message}`);
    }
  }

  console.log("\nDone! Check guy4carbs@gmail.com for the preview emails.");
}

main().catch(console.error).finally(() => process.exit(0));
