/**
 * Apple Wallet Pass Generation Routes
 *
 * Generates .pkpass files for Gold Coast Financial Partners member cards
 * Supports multiple DBAs (Heritage Life Solutions, etc.)
 * Requires Apple Developer Pass Type ID and signing certificates
 */

import { Router } from "express";
import { z } from "zod";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const router = Router();

// DBA Configuration - Add new DBAs here
const DBA_CONFIG: Record<string, {
  name: string;
  logoText: string;
  backgroundColor: string;
  foregroundColor: string;
  labelColor: string;
  supportPhone: string;
  supportEmail: string;
  website: string;
  barcodePrefix: string;
}> = {
  heritage: {
    name: "Heritage Life Solutions",
    logoText: "HERITAGE",
    backgroundColor: "rgb(75, 45, 115)",    // Purple
    foregroundColor: "rgb(255, 255, 255)",  // White
    labelColor: "rgb(200, 180, 130)",       // Gold
    supportPhone: "1-800-HERITAGE",
    supportEmail: "support@heritagels.org",
    website: "heritagels.org",
    barcodePrefix: "HLS"
  },
  // Add future DBAs here:
  // goldcoast: {
  //   name: "Gold Coast Financial Partners",
  //   logoText: "GOLD COAST",
  //   backgroundColor: "rgb(0, 51, 102)",
  //   ...
  // }
};

// Pass generation request schema
const passRequestSchema = z.object({
  memberId: z.string().min(1),
  memberName: z.string().min(1),
  policyNumber: z.string().min(1),
  insuranceCarrier: z.string().min(1),
  coverageAmount: z.string().min(1),
  planType: z.string().min(1),
  effectiveDate: z.string().min(1),
  expirationDate: z.string().optional(),
  beneficiaryName: z.string().min(1),
  agentName: z.string().min(1),
  dba: z.string().default("heritage"), // Which DBA brand to use
});

/**
 * POST /api/wallet/pass
 * Generate a .pkpass file for Apple Wallet
 */
router.post("/pass", async (req, res) => {
  try {
    const data = passRequestSchema.parse(req.body);
    const dbaConfig = DBA_CONFIG[data.dba] || DBA_CONFIG.heritage;

    // Check if we have the required certificates
    const certPath = process.env.APPLE_PASS_CERTIFICATE_PATH;
    const keyPath = process.env.APPLE_PASS_KEY_PATH;
    const wwdrPath = process.env.APPLE_WWDR_CERTIFICATE_PATH;
    const keyPassword = process.env.APPLE_PASS_KEY_PASSWORD || "";

    const hasSigningSetup = certPath && keyPath && wwdrPath &&
                            fs.existsSync(certPath) &&
                            fs.existsSync(keyPath) &&
                            fs.existsSync(wwdrPath);

    if (!hasSigningSetup) {
      return res.status(501).json({
        error: "Pass signing not configured",
        message: "Apple Wallet pass generation requires signing certificates.",
        setupRequired: true,
        instructions: getSetupInstructions()
      });
    }

    // Generate the signed .pkpass file
    const pkpassBuffer = await generateSignedPkpass(data, dbaConfig, {
      certPath,
      keyPath,
      wwdrPath,
      keyPassword
    });

    res.setHeader("Content-Type", "application/vnd.apple.pkpass");
    res.setHeader("Content-Disposition", `attachment; filename="gcf-${data.memberId}.pkpass"`);
    res.send(pkpassBuffer);

  } catch (error: any) {
    console.error("Pass generation error:", error);
    console.error("Error stack:", error?.stack);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request data", details: error.errors });
    }
    res.status(500).json({
      error: "Failed to generate pass",
      details: error?.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
    });
  }
});

/**
 * GET /api/wallet/pass/:memberId
 * Check if a pass exists for a member
 */
router.get("/pass/:memberId", async (req, res) => {
  const { memberId } = req.params;
  res.json({
    memberId,
    passIssued: false,
    message: "Pass status tracking available after database integration"
  });
});

/**
 * GET /api/wallet/setup
 * Get setup instructions and status
 */
router.get("/setup", (req, res) => {
  const certPath = process.env.APPLE_PASS_CERTIFICATE_PATH;
  const keyPath = process.env.APPLE_PASS_KEY_PATH;
  const wwdrPath = process.env.APPLE_WWDR_CERTIFICATE_PATH;

  res.json({
    configured: !!(certPath && keyPath && wwdrPath),
    certificates: {
      passCertificate: certPath ? fs.existsSync(certPath) : false,
      passKey: keyPath ? fs.existsSync(keyPath) : false,
      wwdrCertificate: wwdrPath ? fs.existsSync(wwdrPath) : false,
    },
    passTypeId: process.env.APPLE_PASS_TYPE_IDENTIFIER || "pass.com.goldcoastfnl.membercard",
    teamId: process.env.APPLE_TEAM_IDENTIFIER || "Not set",
    instructions: getSetupInstructions()
  });
});

// Get detailed setup instructions
function getSetupInstructions() {
  return {
    overview: "Apple Wallet passes require cryptographic signing with Apple certificates.",
    steps: [
      {
        step: 1,
        title: "Create Pass Type ID",
        details: [
          "Log in to Apple Developer Portal (developer.apple.com)",
          "Go to Certificates, Identifiers & Profiles",
          "Select 'Identifiers' then click '+' to add new",
          "Choose 'Pass Type IDs'",
          "Enter description: 'Gold Coast Financial Partners Member Card'",
          "Enter identifier: 'pass.com.goldcoastfnl.membercard'",
          "Click Register"
        ]
      },
      {
        step: 2,
        title: "Create Signing Certificate",
        details: [
          "In Apple Developer Portal, go to Certificates",
          "Click '+' to create new certificate",
          "Select 'Pass Type ID Certificate'",
          "Select your Pass Type ID (pass.com.goldcoastfnl.membercard)",
          "Follow prompts to create CSR using Keychain Access",
          "Upload CSR and download the certificate (.cer file)"
        ]
      },
      {
        step: 3,
        title: "Export Certificate and Key",
        details: [
          "Double-click .cer file to add to Keychain",
          "Open Keychain Access, find the certificate",
          "Right-click > Export > Save as .p12 file",
          "Set a password (you'll need this later)",
          "Convert to PEM format using these commands:"
        ],
        commands: [
          "# Extract certificate:",
          "openssl pkcs12 -in certificate.p12 -clcerts -nokeys -out pass-cert.pem",
          "",
          "# Extract private key:",
          "openssl pkcs12 -in certificate.p12 -nocerts -out pass-key.pem",
          "",
          "# Remove passphrase from key (optional but recommended):",
          "openssl rsa -in pass-key.pem -out pass-key-nopass.pem"
        ]
      },
      {
        step: 4,
        title: "Download WWDR Certificate",
        details: [
          "Download Apple WWDR (Worldwide Developer Relations) certificate",
          "URL: https://www.apple.com/certificateauthority/",
          "Download 'Worldwide Developer Relations - G4' certificate",
          "Convert to PEM format:"
        ],
        commands: [
          "openssl x509 -in AppleWWDRCAG4.cer -inform DER -out wwdr.pem -outform PEM"
        ]
      },
      {
        step: 5,
        title: "Create Pass Assets",
        details: [
          "Create image files for your pass:",
          "- icon.png (29x29), icon@2x.png (58x58), icon@3x.png (87x87)",
          "- logo.png (160x50), logo@2x.png (320x100), logo@3x.png (480x150)",
          "Place in: server/assets/wallet/"
        ]
      },
      {
        step: 6,
        title: "Configure Environment Variables",
        details: [
          "Add to your .env file:"
        ],
        envVars: {
          APPLE_PASS_TYPE_IDENTIFIER: "pass.com.goldcoastfnl.membercard",
          APPLE_TEAM_IDENTIFIER: "YOUR_TEAM_ID",
          APPLE_PASS_CERTIFICATE_PATH: "./certs/pass-cert.pem",
          APPLE_PASS_KEY_PATH: "./certs/pass-key.pem",
          APPLE_WWDR_CERTIFICATE_PATH: "./certs/wwdr.pem",
          APPLE_PASS_KEY_PASSWORD: ""
        }
      }
    ],
    documentation: {
      apple: "https://developer.apple.com/documentation/walletpasses",
      passDesign: "https://developer.apple.com/design/human-interface-guidelines/wallet"
    }
  };
}

// Generate pass.json structure
function generatePassJson(
  data: z.infer<typeof passRequestSchema>,
  dbaConfig: typeof DBA_CONFIG.heritage
) {
  const passTypeIdentifier = process.env.APPLE_PASS_TYPE_IDENTIFIER || "pass.com.goldcoastfnl.membercard";
  const teamIdentifier = process.env.APPLE_TEAM_IDENTIFIER || "XXXXXXXXXX";

  return {
    formatVersion: 1,
    passTypeIdentifier,
    teamIdentifier,
    serialNumber: data.memberId,
    organizationName: dbaConfig.name,
    description: `${dbaConfig.name} Member Card`,
    logoText: dbaConfig.logoText,
    foregroundColor: dbaConfig.foregroundColor,
    backgroundColor: dbaConfig.backgroundColor,
    labelColor: dbaConfig.labelColor,

    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        message: `${dbaConfig.barcodePrefix}:${data.memberId}:${data.policyNumber}`,
        messageEncoding: "iso-8859-1"
      }
    ],

    generic: {
      primaryFields: [
        {
          key: "memberName",
          label: "MEMBER",
          value: data.memberName
        }
      ],
      secondaryFields: [
        {
          key: "coverage",
          label: "COVERAGE",
          value: data.coverageAmount
        },
        {
          key: "planType",
          label: "PLAN TYPE",
          value: data.planType
        }
      ],
      auxiliaryFields: [
        {
          key: "carrier",
          label: "CARRIER",
          value: data.insuranceCarrier
        },
        {
          key: "effective",
          label: "EFFECTIVE",
          value: data.effectiveDate
        }
      ],
      backFields: [
        {
          key: "policyNumber",
          label: "Policy Number",
          value: data.policyNumber
        },
        {
          key: "memberId",
          label: "Member ID",
          value: data.memberId
        },
        {
          key: "beneficiary",
          label: "Primary Beneficiary",
          value: data.beneficiaryName
        },
        {
          key: "agent",
          label: "Servicing Agent",
          value: data.agentName
        },
        {
          key: "expiration",
          label: "Expiration",
          value: data.expirationDate || "N/A"
        },
        {
          key: "support",
          label: "Customer Support",
          value: `${dbaConfig.supportPhone}\n${dbaConfig.supportEmail}\n${dbaConfig.website}`
        },
        {
          key: "parent",
          label: "Operated By",
          value: "Gold Coast Financial Partners"
        },
        {
          key: "disclaimer",
          label: "Important Notice",
          value: "This card is for identification purposes only and does not guarantee coverage. Please refer to your policy documents for complete terms and conditions."
        }
      ]
    },

    webServiceURL: process.env.APP_URL ? `${process.env.APP_URL}/api/wallet` : undefined,
    authenticationToken: crypto.randomBytes(16).toString("hex")
  };
}

// Generate signed .pkpass file
async function generateSignedPkpass(
  data: z.infer<typeof passRequestSchema>,
  dbaConfig: typeof DBA_CONFIG.heritage,
  certs: {
    certPath: string;
    keyPath: string;
    wwdrPath: string;
    keyPassword: string;
  }
): Promise<Buffer> {
  const tempDir = path.join("/tmp", `pass-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Generate pass.json
    const passJson = generatePassJson(data, dbaConfig);
    const passJsonPath = path.join(tempDir, "pass.json");
    fs.writeFileSync(passJsonPath, JSON.stringify(passJson, null, 2));

    // Copy assets if they exist (use process.cwd() for tsx compatibility)
    const projectRoot = process.cwd();
    const assetsDir = path.join(projectRoot, "server/assets/wallet", data.dba);
    const defaultAssetsDir = path.join(projectRoot, "server/assets/wallet/default");
    const assetSource = fs.existsSync(assetsDir) ? assetsDir : defaultAssetsDir;

    if (fs.existsSync(assetSource)) {
      const assets = ["icon.png", "icon@2x.png", "icon@3x.png", "logo.png", "logo@2x.png", "logo@3x.png"];
      for (const asset of assets) {
        const srcPath = path.join(assetSource, asset);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, path.join(tempDir, asset));
        }
      }
    }

    // Create manifest.json with SHA1 hashes
    const manifest: Record<string, string> = {};
    const files = fs.readdirSync(tempDir);
    for (const file of files) {
      if (file !== "manifest.json" && file !== "signature") {
        const content = fs.readFileSync(path.join(tempDir, file));
        manifest[file] = crypto.createHash("sha1").update(content).digest("hex");
      }
    }
    const manifestPath = path.join(tempDir, "manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // Sign the manifest
    const signaturePath = path.join(tempDir, "signature");
    const passwordArg = certs.keyPassword ? `-passin pass:${certs.keyPassword}` : "";

    execSync(
      `openssl smime -binary -sign -certfile "${certs.wwdrPath}" -signer "${certs.certPath}" -inkey "${certs.keyPath}" ${passwordArg} -in "${manifestPath}" -out "${signaturePath}" -outform DER`,
      { stdio: "pipe" }
    );

    // Create .pkpass zip
    const pkpassPath = path.join(tempDir, "pass.pkpass");
    const filesToZip = fs.readdirSync(tempDir).filter(f => f !== "pass.pkpass");

    // Use zip command to create the pass
    const fileList = filesToZip.join(" ");
    execSync(`cd "${tempDir}" && zip -q pass.pkpass ${fileList}`, { stdio: "pipe" });

    // Read and return the pkpass
    const pkpassBuffer = fs.readFileSync(pkpassPath);

    return pkpassBuffer;

  } finally {
    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

export default router;
