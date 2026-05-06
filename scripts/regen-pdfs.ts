import "dotenv/config";
import { pool } from "../server/db";
import { generateSignedPdf } from "../server/services/documentSigningService";
import { uploadFile, isS3Available } from "../server/services/s3Service";

async function main() {
  const uid = "7ecbc519-29eb-454d-919d-bca5615626e6";
  const u = await pool.query("SELECT first_name, last_name, email FROM users WHERE id = $1", [uid]);
  const user = u.rows[0];
  console.log("Signer:", user.first_name, user.last_name);
  console.log("Firebase available:", isS3Available());

  const signerInfo = { name: `${user.first_name} ${user.last_name}`, email: user.email, ipAddress: "127.0.0.1", userAgent: "Server-Regeneration", signedAt: new Date() };

  for (const docType of ["nda", "debt_rollup", "compliance"] as const) {
    console.log(`\nGenerating ${docType}...`);
    const pdf = await generateSignedPdf(docType, signerInfo);
    console.log(`  PDF size: ${pdf.length} bytes`);

    const result = await uploadFile(uid, `${docType}-signed.pdf`, pdf, { contentType: "application/pdf", metadata: { documentType: docType } }, "signed-documents");

    if (result.success && result.key) {
      console.log(`  Uploaded: ${result.key}`);
      const col = docType === "nda" ? "nda" : docType === "debt_rollup" ? "debt_rollup" : "compliance";
      await pool.query(`UPDATE contracting_checklists SET ${col}_document_key = $1 WHERE agent_user_id::text = $2`, [result.key, uid]);
      console.log("  DB updated ✓");
    } else {
      console.log("  Upload FAILED:", result.error);
    }
  }

  // Verify
  const c = await pool.query("SELECT nda_document_key, debt_rollup_document_key, compliance_document_key FROM contracting_checklists WHERE agent_user_id::text = $1", [uid]);
  const keys = c.rows[0];
  console.log("\n=== VERIFICATION ===");
  console.log("NDA:", keys.nda_document_key?.includes("/") ? "Firebase key ✓" : "Hash ✗");
  console.log("Debt:", keys.debt_rollup_document_key?.includes("/") ? "Firebase key ✓" : "Hash ✗");
  console.log("Compliance:", keys.compliance_document_key?.includes("/") ? "Firebase key ✓" : "Hash ✗");

  await pool.end();
}

main().catch(console.error);
