/**
 * DocuSign Service
 * Handles JWT auth, envelope creation, and embedded signing URL generation.
 * Uses Node.js built-in crypto — no external JWT library needed.
 */

import crypto from "crypto";

// ---------------------------------------------------------------------------
// Config from environment
// ---------------------------------------------------------------------------
const INTEGRATION_KEY = process.env.DOCUSIGN_INTEGRATION_KEY || "";
const USER_ID = process.env.DOCUSIGN_USER_ID || "";
const ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID || "";
const BASE_URL = process.env.DOCUSIGN_BASE_URL || "https://demo.docusign.net";
const RSA_PRIVATE_KEY = (process.env.DOCUSIGN_RSA_PRIVATE_KEY || "").replace(
  /\\n/g,
  "\n"
);

// Demo vs production OAuth host
const OAUTH_HOST = BASE_URL.includes("demo")
  ? "account-d.docusign.com"
  : "account.docusign.com";

const APP_URL =
  process.env.APP_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://heritagels.org"
    : "http://localhost:4500");

// ---------------------------------------------------------------------------
// Token cache
// ---------------------------------------------------------------------------
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

// ---------------------------------------------------------------------------
// DocuSign Template IDs — real documents uploaded in DocuSign admin
// ---------------------------------------------------------------------------
const TEMPLATE_IDS: Record<string, string> = {
  nda: "a66747b3-52b6-488a-b3eb-db3617c33474",
  debt_rollup: "17e4d8a3-2783-452d-99f2-6f5aa15d8f33",
  compliance: "ac07ab59-5c4a-42f4-ad5c-6c1064887ee4",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Base64url encode */
function base64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/** Create a signed JWT for DocuSign OAuth */
function createJWT(): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { typ: "JWT", alg: "RS256" };
  const payload = {
    iss: INTEGRATION_KEY,
    sub: USER_ID,
    aud: OAUTH_HOST,
    iat: now,
    exp: now + 3600,
    scope: "signature impersonation",
  };

  const segments = [
    base64url(JSON.stringify(header)),
    base64url(JSON.stringify(payload)),
  ];

  const signingInput = segments.join(".");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(RSA_PRIVATE_KEY);

  return `${signingInput}.${base64url(signature)}`;
}

/** Get an access token (cached until expiry) */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.accessToken;
  }

  const jwt = createJWT();

  const res = await fetch(`https://${OAUTH_HOST}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DocuSign OAuth failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  console.log("[DocuSign] Access token obtained");
  return cachedToken.accessToken;
}


// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Check if DocuSign is configured */
export function isConfigured(): boolean {
  return !!(INTEGRATION_KEY && USER_ID && ACCOUNT_ID && RSA_PRIVATE_KEY);
}

/** Document display names */
export const DOCUMENT_NAMES: Record<string, string> = {
  nda: "Non-Disclosure, Non-Use, Non-Solicitation, and Lead Protection Agreement",
  debt_rollup: "Debt Roll-Up Protection and Authorization Agreement",
  compliance: "Compliance and Ethical Conduct Agreement",
};

/**
 * Create an envelope from a DocuSign template and return the envelope ID.
 * Uses real documents uploaded in the DocuSign admin console.
 */
export async function createEnvelope(
  documentId: string,
  signerName: string,
  signerEmail: string,
  clientUserId: string
): Promise<string> {
  const token = await getAccessToken();
  const templateId = TEMPLATE_IDS[documentId];
  if (!templateId) throw new Error(`No template configured for document: ${documentId}`);
  const docName = DOCUMENT_NAMES[documentId] || documentId;

  const envelopeBody = {
    templateId,
    emailSubject: `Heritage Life Solutions — ${docName}`,
    templateRoles: [
      {
        email: signerEmail,
        name: signerName,
        roleName: "agent",
        clientUserId, // Makes it an embedded signer
      },
    ],
    status: "sent",
  };

  const res = await fetch(
    `${BASE_URL}/restapi/v2.1/accounts/${ACCOUNT_ID}/envelopes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(envelopeBody),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DocuSign create envelope failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  console.log(
    `[DocuSign] Envelope created: ${data.envelopeId} for ${docName} (template: ${templateId})`
  );
  return data.envelopeId;
}

/**
 * Generate an embedded signing URL for an envelope.
 * Returns the URL that should be loaded in an iframe.
 */
export async function getSigningUrl(
  envelopeId: string,
  signerName: string,
  signerEmail: string,
  clientUserId: string,
  returnUrl: string
): Promise<string> {
  const token = await getAccessToken();

  const viewBody = {
    returnUrl,
    authenticationMethod: "none",
    email: signerEmail,
    userName: signerName,
    clientUserId,
    frameAncestors: [APP_URL],
    messageOrigins: [APP_URL],
  };

  const res = await fetch(
    `${BASE_URL}/restapi/v2.1/accounts/${ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(viewBody),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `DocuSign recipient view failed (${res.status}): ${body}`
    );
  }

  const data = await res.json();
  console.log(`[DocuSign] Signing URL generated for envelope ${envelopeId}`);
  return data.url;
}

/**
 * Check the status of an envelope.
 */
export async function getEnvelopeStatus(
  envelopeId: string
): Promise<{ status: string; completedDateTime?: string }> {
  const token = await getAccessToken();

  const res = await fetch(
    `${BASE_URL}/restapi/v2.1/accounts/${ACCOUNT_ID}/envelopes/${envelopeId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `DocuSign get envelope failed (${res.status}): ${body}`
    );
  }

  const data = await res.json();
  return {
    status: data.status,
    completedDateTime: data.completedDateTime,
  };
}

/**
 * Download the signed document PDF from a completed envelope.
 * Returns the PDF as a Buffer.
 * documentId "1" = first document, "combined" = all docs merged.
 */
export async function downloadDocument(
  envelopeId: string,
  documentId: string = "1"
): Promise<Buffer> {
  const token = await getAccessToken();

  const res = await fetch(
    `${BASE_URL}/restapi/v2.1/accounts/${ACCOUNT_ID}/envelopes/${envelopeId}/documents/${documentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `DocuSign download document failed (${res.status}): ${body}`
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  console.log(
    `[DocuSign] Downloaded document ${documentId} from envelope ${envelopeId} (${arrayBuffer.byteLength} bytes)`
  );
  return Buffer.from(arrayBuffer);
}
