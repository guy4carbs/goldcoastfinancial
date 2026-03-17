/**
 * Policy Verification Routes
 *
 * Generates verification page and PDF when a member's QR code is scanned
 * Shows Heritage Life Solutions branding + carrier logo + complete policy details
 */

import { Router } from "express";
import PDFDocument from "pdfkit";
import sharp from "sharp";

const router = Router();

// Carrier logo URLs (Firebase Storage)
const CARRIER_LOGOS: Record<string, string> = {
  "americo": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277183671-cropped-Americologo_red_289-2.png?alt=media&token=29048512-a27a-454c-959e-096a921d68ba",
  "american national": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277359214-logo.png?alt=media&token=6770c112-2236-4b92-b80e-2811635f6643",
  "foresters": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277409363-logo%402x.png?alt=media&token=cdd3c6d0-e497-4a4c-a357-6e3b548dd95c",
  "corebridge": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277446062-Corebridge_financial_logo.svg.png?alt=media&token=cd088f44-4437-432e-88a3-b3a54ee520e2",
  "corebridge financial": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277446062-Corebridge_financial_logo.svg.png?alt=media&token=cd088f44-4437-432e-88a3-b3a54ee520e2",
  "mutual of omaha": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277474666-Mutual-of-Omaha-logo.png?alt=media&token=0382cf9c-c262-4931-8155-688210c1c173",
  "sbli": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277532663-6341f9fa-fd59-42aa-b238-d23e46658048.png?alt=media&token=ea3d4914-d65e-4817-9a81-1ea709064e52",
  "royal neighbors": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277589538-330-3309455_royal-neighbors-of-america-life-insurance-royal-neighbors.png?alt=media&token=d700619b-ad2d-4071-bd2b-a57eb5a12b56",
  "royal neighbors of america": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277589538-330-3309455_royal-neighbors-of-america-life-insurance-royal-neighbors.png?alt=media&token=d700619b-ad2d-4071-bd2b-a57eb5a12b56",
  "american home life": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277674404-Carrier-Logo-Web-270x200-American-Home-Life-1080x608.webp?alt=media&token=0546ea66-443d-44bc-b2f1-d561bd1f713b",
  "polish falcons": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277746680-Polish_Falcons_of_America_Logo.png?alt=media&token=c50ffd89-0c8c-4e05-81ed-23289b74f238",
  "polish falcons of america": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277746680-Polish_Falcons_of_America_Logo.png?alt=media&token=c50ffd89-0c8c-4e05-81ed-23289b74f238",
  "ladder": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277843227-Ladder-Logo-Full-Black.png?alt=media&token=b8543d44-66ce-4afe-96da-809fd4817733",
  "lincoln financial": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277880206-Lincoln-Financial-Logo-old.png?alt=media&token=b8028b6a-d38c-42e7-bb83-9a3d5750524b",
  "lincoln": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769277880206-Lincoln-Financial-Logo-old.png?alt=media&token=b8028b6a-d38c-42e7-bb83-9a3d5750524b",
  "transamerica": "https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/logos%2F1769278248208-transamerica-logo.png?alt=media&token=9d6fb91f-9c8e-432b-96e4-c4ed8971cc6d",
};

// Get demo policy data
function getPolicyData(memberId: string) {
  return {
    memberId,
    memberName: "John Smith",
    dateOfBirth: "January 15, 1985",
    address: "123 Main Street, Chicago, IL 60601",
    phone: "(312) 555-1234",
    email: "john.smith@email.com",
    policyNumber: `POL-${memberId.slice(-6) || "789456"}`,
    insuranceCarrier: "Mutual of Omaha",
    coverageAmount: "$500,000",
    planType: "20-Year Term Life",
    effectiveDate: "January 1, 2026",
    expirationDate: "January 1, 2046",
    premiumAmount: "$125.00/month",
    paymentFrequency: "Monthly",
    status: "Active",
    beneficiaryName: "Jane Smith",
    beneficiaryRelation: "Spouse",
    contingentBeneficiary: "Michael Smith (Son)",
    agentName: "Robert Williams",
    agentPhone: "(800) 555-HERITAGE",
    agentEmail: "rwilliams@heritagels.org",
    verificationCode: `VER-${Date.now().toString(36).toUpperCase()}`,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * GET /verify/:memberId
 * HTML verification page
 */
router.get("/:memberId", async (req, res) => {
  const { memberId } = req.params;
  const policy = getPolicyData(memberId);

  const carrierLogoKey = policy.insuranceCarrier.toLowerCase();
  const carrierLogo = CARRIER_LOGOS[carrierLogoKey] || null;

  const statusColor = policy.status === "Active" ? "#22c55e" : "#f59e0b";
  const statusBg = policy.status === "Active" ? "#dcfce7" : "#fef3c7";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Policy Verification - Heritage Life Solutions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #f8f7ff 0%, #f0ebe3 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 600px; margin: 0 auto; }
    .card {
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(75, 45, 115, 0.15);
      overflow: hidden;
      margin-bottom: 20px;
    }
    .header {
      background: linear-gradient(135deg, #4B2D73 0%, #6B4D93 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .shield-icon { width: 48px; height: 48px; fill: #C8B482; }
    .brand-text { text-align: left; }
    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 700;
      color: white;
      letter-spacing: 2px;
    }
    .brand-tagline {
      font-size: 11px;
      color: rgba(255,255,255,0.85);
      letter-spacing: 1.5px;
      margin-top: 2px;
    }
    .verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.15);
      padding: 8px 16px;
      border-radius: 100px;
      color: #C8B482;
      font-size: 13px;
      font-weight: 600;
    }
    .verified-icon { width: 18px; height: 18px; fill: #22c55e; }
    .content { padding: 24px; }
    .status-section { text-align: center; margin-bottom: 24px; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      background: ${statusBg};
      color: ${statusColor};
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${statusColor};
    }
    .member-name {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 600;
      color: #1a1a2e;
      text-align: center;
      margin-bottom: 8px;
    }
    .member-id {
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 24px;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #4B2D73;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #C8B482;
    }
    .info-grid {
      display: grid;
      gap: 12px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label {
      font-size: 13px;
      color: #6b7280;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
      text-align: right;
    }
    .coverage-value {
      font-size: 20px;
      color: #4B2D73;
    }
    .carrier-section {
      background: #fafafa;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .carrier-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .carrier-logo {
      max-height: 120px;
      max-width: 280px;
      object-fit: contain;
    }
    .carrier-name {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a2e;
    }
    .agent-card {
      background: linear-gradient(135deg, #4B2D73 0%, #6B4D93 100%);
      border-radius: 12px;
      padding: 20px;
      color: white;
      margin-bottom: 24px;
    }
    .agent-title {
      font-size: 11px;
      color: #C8B482;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .agent-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .agent-contact {
      font-size: 13px;
      opacity: 0.9;
    }
    .contact-box {
      background: #f5f5f5;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .contact-title {
      font-size: 11px;
      color: #4B2D73;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .contact-phone {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .contact-email {
      font-size: 13px;
      color: #6b7280;
    }
    .download-btn {
      display: block;
      width: 100%;
      padding: 16px;
      background: #4B2D73;
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 24px;
      transition: background 0.2s;
    }
    .download-btn:hover { background: #3a2259; }
    .verification-time {
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
      margin-bottom: 16px;
    }
    .legal-footer {
      padding: 24px;
      background: #f5f5f5;
    }
    .legal-text {
      font-size: 10px;
      color: #6b7280;
      line-height: 1.7;
    }
    .legal-text p { margin-bottom: 12px; }
    .legal-text p:last-child { margin-bottom: 0; }
    .copyright {
      font-weight: 600;
      color: #4B2D73;
      margin-bottom: 16px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo-section">
          <svg class="shield-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          <div class="brand-text">
            <div class="brand-name">HERITAGE</div>
            <div class="brand-tagline">LIFE SOLUTIONS</div>
          </div>
        </div>
        <div class="verified-badge">
          <svg class="verified-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          VERIFIED POLICY
        </div>
      </div>

      <div class="content">
        <div class="status-section">
          <span class="status-badge">
            <span class="status-dot"></span>
            ${policy.status}
          </span>
        </div>

        <div class="member-name">${escapeHtml(policy.memberName)}</div>
        <div class="member-id">Member ID: ${escapeHtml(policy.memberId)}</div>

        <!-- Member Information -->
        <div class="section">
          <div class="section-title">Member Information</div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Date of Birth</span>
              <span class="info-value">${escapeHtml(policy.dateOfBirth)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Address</span>
              <span class="info-value">${escapeHtml(policy.address)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone</span>
              <span class="info-value">${escapeHtml(policy.phone)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">${escapeHtml(policy.email)}</span>
            </div>
          </div>
        </div>

        <!-- Policy Details -->
        <div class="section">
          <div class="section-title">Policy Details</div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Policy Number</span>
              <span class="info-value">${escapeHtml(policy.policyNumber)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Plan Type</span>
              <span class="info-value">${escapeHtml(policy.planType)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Coverage Amount</span>
              <span class="info-value coverage-value">${escapeHtml(policy.coverageAmount)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Premium</span>
              <span class="info-value">${escapeHtml(policy.premiumAmount)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Effective Date</span>
              <span class="info-value">${escapeHtml(policy.effectiveDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Expiration Date</span>
              <span class="info-value">${escapeHtml(policy.expirationDate)}</span>
            </div>
          </div>
        </div>

        <!-- Beneficiary Information -->
        <div class="section">
          <div class="section-title">Beneficiary Information</div>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Primary Beneficiary</span>
              <span class="info-value">${escapeHtml(policy.beneficiaryName)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Relationship</span>
              <span class="info-value">${escapeHtml(policy.beneficiaryRelation)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Contingent Beneficiary</span>
              <span class="info-value">${escapeHtml(policy.contingentBeneficiary)}</span>
            </div>
          </div>
        </div>

        <!-- Carrier -->
        <div class="carrier-section">
          <div class="carrier-label">Underwritten By</div>
          ${carrierLogo
            ? `<img src="${carrierLogo}" alt="${escapeHtml(policy.insuranceCarrier)}" class="carrier-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
               <div class="carrier-name" style="display:none">${escapeHtml(policy.insuranceCarrier)}</div>`
            : `<div class="carrier-name">${escapeHtml(policy.insuranceCarrier)}</div>`
          }
        </div>

        <!-- Agent -->
        <div class="agent-card">
          <div class="agent-title">Your Agent</div>
          <div class="agent-name">${escapeHtml(policy.agentName)}</div>
          <div class="agent-contact">${escapeHtml(policy.agentPhone)}</div>
          <div class="agent-contact">${escapeHtml(policy.agentEmail)}</div>
        </div>

        <!-- Contact -->
        <div class="contact-box">
          <div class="contact-title">Customer Service</div>
          <div class="contact-phone">1-800-HERITAGE</div>
          <div class="contact-email">support@heritagels.org</div>
        </div>

        <!-- Download PDF -->
        <a href="/verify/${memberId}/pdf" class="download-btn">
          📄 Download PDF Certificate
        </a>

        <div class="verification-time">
          Verified on ${new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
          <br>Code: ${policy.verificationCode}
        </div>
      </div>

      <div class="legal-footer">
        <div class="legal-text">
          <p class="copyright">© 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners.</p>
          <p>We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.</p>
          <p>At Heritage, we believe protecting your family shouldn't be complicated. Our streamlined process connects you with coverage options from top-rated carriers, often without the need for medical exams. Most applications take just minutes to complete, and approvals can happen within 24-48 hours.</p>
          <p>Life insurance premiums are based on factors including age, health, and coverage amount. Locking in coverage sooner typically means lower rates. Once your policy is in place, your premium remains fixed for the duration of your term.</p>
          <p>Heritage Life Solutions partners with A-rated insurance carriers to provide comprehensive coverage options. All quotes are subject to underwriting approval by the issuing carrier.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

/**
 * GET /verify/:memberId/pdf
 * Downloadable PDF certificate
 */
router.get("/:memberId/pdf", async (req, res) => {
  const { memberId } = req.params;
  const policy = getPolicyData(memberId);

  const carrierLogoKey = policy.insuranceCarrier.toLowerCase();
  const carrierLogoUrl = CARRIER_LOGOS[carrierLogoKey] || null;

  const COLORS = {
    purple: "#4B2D73",
    gold: "#C8B482",
    text: "#1a1a2e",
    textLight: "#6b7280",
    success: "#22c55e",
  };

  // Fetch carrier logo image and convert to JPEG for PDF compatibility
  let carrierLogoBuffer: Buffer | null = null;
  if (carrierLogoUrl) {
    try {
      console.log("Fetching carrier logo from:", carrierLogoUrl);
      const response = await fetch(carrierLogoUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const originalBuffer = Buffer.from(arrayBuffer);
        console.log("Carrier logo fetched, size:", originalBuffer.length, "bytes");

        // Convert to PNG with proper color space using sharp
        // This fixes color issues and removes problematic alpha channels
        carrierLogoBuffer = await sharp(originalBuffer)
          .flatten({ background: { r: 255, g: 255, b: 255 } }) // White background for transparency
          .png()
          .toBuffer();
        console.log("Carrier logo converted, new size:", carrierLogoBuffer.length, "bytes");
      } else {
        console.log("Failed to fetch carrier logo, status:", response.status);
      }
    } catch (err) {
      console.log("Could not fetch/convert carrier logo:", err);
    }
  } else {
    console.log("No carrier logo URL found for:", policy.insuranceCarrier);
  }

  try {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Policy Verification - ${policy.memberName}`,
        Author: "Heritage Life Solutions",
        Subject: "Insurance Policy Verification Certificate",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Heritage-Policy-${memberId}.pdf"`);

    doc.pipe(res);

    // Header
    doc.rect(0, 0, 612, 100).fill(COLORS.purple);
    doc.fontSize(28).font("Helvetica-Bold").fillColor("#FFFFFF").text("HERITAGE", 50, 30);
    doc.fontSize(12).font("Helvetica").fillColor(COLORS.gold).text("LIFE SOLUTIONS", 50, 60);
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#FFFFFF").text("POLICY VERIFICATION CERTIFICATE", 350, 40, { align: "right" });
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.gold).text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`, 350, 55, { align: "right" });
    doc.fontSize(8).fillColor("#FFFFFF").text(`Code: ${policy.verificationCode}`, 350, 70, { align: "right" });

    let yPos = 120;

    // Status
    const statusColor = policy.status === "Active" ? COLORS.success : "#f59e0b";
    doc.roundedRect(50, yPos, 100, 24, 12).fill(statusColor);
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#FFFFFF").text(policy.status.toUpperCase(), 50, yPos + 6, { width: 100, align: "center" });
    yPos += 50;

    // Member Info
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.purple).text("MEMBER INFORMATION", 50, yPos);
    doc.moveTo(50, yPos + 20).lineTo(250, yPos + 20).stroke(COLORS.gold);
    yPos += 30;

    [["Full Name", policy.memberName], ["Member ID", policy.memberId], ["Date of Birth", policy.dateOfBirth], ["Address", policy.address], ["Phone", policy.phone], ["Email", policy.email]].forEach(([label, value]) => {
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.textLight).text(label, 50, yPos);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.text).text(value, 150, yPos);
      yPos += 18;
    });
    yPos += 15;

    // Policy Details
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.purple).text("POLICY DETAILS", 50, yPos);
    doc.moveTo(50, yPos + 20).lineTo(250, yPos + 20).stroke(COLORS.gold);
    yPos += 30;

    [["Policy Number", policy.policyNumber], ["Plan Type", policy.planType], ["Coverage Amount", policy.coverageAmount], ["Premium", policy.premiumAmount], ["Effective Date", policy.effectiveDate], ["Expiration Date", policy.expirationDate]].forEach(([label, value]) => {
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.textLight).text(label, 50, yPos);
      const isAmount = label === "Coverage Amount";
      doc.fontSize(isAmount ? 12 : 10).font("Helvetica-Bold").fillColor(isAmount ? COLORS.purple : COLORS.text).text(value, 150, yPos);
      yPos += 18;
    });
    yPos += 15;

    // Beneficiary
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.purple).text("BENEFICIARY INFORMATION", 50, yPos);
    doc.moveTo(50, yPos + 20).lineTo(250, yPos + 20).stroke(COLORS.gold);
    yPos += 30;

    [["Primary Beneficiary", policy.beneficiaryName], ["Relationship", policy.beneficiaryRelation], ["Contingent", policy.contingentBeneficiary]].forEach(([label, value]) => {
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.textLight).text(label, 50, yPos);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.text).text(value, 150, yPos);
      yPos += 18;
    });

    // Right side - Carrier section with background
    doc.roundedRect(340, 115, 220, 100, 8).fill("#fafafa");
    doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.purple).text("UNDERWRITTEN BY", 350, 125);
    doc.moveTo(350, 142).lineTo(550, 142).stroke(COLORS.gold);

    // Carrier logo or name - single image, proper size
    let carrierEndY = 225;
    if (carrierLogoBuffer) {
      try {
        // Just use width to scale proportionally - simpler and more reliable
        doc.image(carrierLogoBuffer, 360, 152, { width: 180 });
      } catch (imgErr) {
        console.log("Could not embed carrier logo:", imgErr);
        doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.text).text(policy.insuranceCarrier, 350, 165, { width: 200, align: 'center' });
      }
    } else {
      doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.text).text(policy.insuranceCarrier, 350, 165, { width: 200, align: 'center' });
    }

    // Agent section with background
    const agentY = carrierEndY + 10;
    doc.roundedRect(340, agentY, 220, 90, 8).fill(COLORS.purple);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.gold).text("YOUR AGENT", 350, agentY + 12);
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#FFFFFF").text(policy.agentName, 350, agentY + 30);
    doc.fontSize(10).font("Helvetica").fillColor("#FFFFFF").text(policy.agentPhone, 350, agentY + 50);
    doc.fontSize(10).fillColor("#FFFFFF").text(policy.agentEmail, 350, agentY + 65);

    // Customer service section
    const contactY = agentY + 100;
    doc.roundedRect(340, contactY, 220, 80, 8).fill("#f5f5f5");
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.purple).text("CUSTOMER SERVICE", 350, contactY + 12);
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.text).text("1-800-HERITAGE", 350, contactY + 30);
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.textLight).text("support@heritagels.org", 350, contactY + 48);
    doc.text("heritagels.org", 350, contactY + 62);

    // Footer
    const footerY = 620;
    doc.moveTo(50, footerY).lineTo(562, footerY).stroke("#e5e5e5");
    doc.fontSize(7).font("Helvetica").fillColor(COLORS.textLight)
      .text("© 2026 Gold Coast Financial Partners. Heritage Life Solutions is a DBA of Gold Coast Financial Partners. We operate as an independent insurance agency, licensed in all 50 states. IL License #22128144. Policies are issued by our carrier partners and product availability may vary by state.", 50, footerY + 15, { width: 512, align: "justify" })
      .text("At Heritage, we believe protecting your family shouldn't be complicated. Our streamlined process connects you with coverage options from top-rated carriers, often without the need for medical exams. Most applications take just minutes to complete, and approvals can happen within 24-48 hours.", 50, footerY + 55, { width: 512, align: "justify" })
      .text("Life insurance premiums are based on factors including age, health, and coverage amount. Locking in coverage sooner typically means lower rates. Once your policy is in place, your premium remains fixed for the duration of your term. Heritage Life Solutions partners with A-rated insurance carriers to provide comprehensive coverage options. All quotes are subject to underwriting approval by the issuing carrier.", 50, footerY + 95, { width: 512, align: "justify" });

    doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.purple)
      .text(`This document was generated on ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}`, 50, footerY + 145, { width: 512, align: "center" });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export default router;
