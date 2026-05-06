#!/usr/bin/env node
// Render every policy + the ISP + acknowledgement template into a branded
// HTML file that's print-ready as a Gold Coast Financial Partners LLC
// legal document.
//
// Output: ~/Desktop/GCF-Policies-To-Sign/*.html
// To get a PDF: open each .html in Safari/Chrome → File → Print → Save as PDF.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { marked } from "marked";

const REPO = "/Users/guy4carbs/gcf";
const OUT = path.join(os.homedir(), "Desktop", "GCF-Policies-To-Sign");
const TODAY = new Date().toISOString().slice(0, 10);

const DOCS = [
  ["01-information-security-program", "Information Security Program", "ISP", "1.0", "Qualified Individual"],
  ["02-acceptable-use", "Acceptable Use Policy", "Policy", "1.0", "Qualified Individual"],
  ["03-change-management", "Change Management Policy", "Policy", "1.0", "Qualified Individual"],
  ["04-code-of-conduct", "Code of Conduct", "Policy", "1.0", "Qualified Individual"],
  ["05-data-classification", "Data Classification Policy", "Policy", "1.0", "Qualified Individual"],
  ["06-data-retention", "Data Retention Policy", "Policy", "1.0", "Qualified Individual"],
  ["07-password-and-session", "Password & Session Policy", "Policy", "1.0", "Qualified Individual"],
  ["08-vendor-management", "Vendor Management Policy", "Policy", "1.0", "Qualified Individual"],
  ["09-vulnerability-management", "Vulnerability Management Policy", "Policy", "1.0", "Qualified Individual"],
];

const SOURCES = {
  "01-information-security-program": `${REPO}/docs/security/glba/information-security-program.md`,
  "02-acceptable-use": `${REPO}/docs/security/policies/acceptable-use.md`,
  "03-change-management": `${REPO}/docs/security/policies/change-management.md`,
  "04-code-of-conduct": `${REPO}/docs/security/policies/code-of-conduct.md`,
  "05-data-classification": `${REPO}/docs/security/policies/data-classification.md`,
  "06-data-retention": `${REPO}/docs/security/policies/data-retention.md`,
  "07-password-and-session": `${REPO}/docs/security/policies/password-and-session.md`,
  "08-vendor-management": `${REPO}/docs/security/policies/vendor-management.md`,
  "09-vulnerability-management": `${REPO}/docs/security/policies/vulnerability-management.md`,
};

const ACK_SRC = `${REPO}/docs/security/templates/policy-acknowledgement.md`;
const FOUNDERS = ["Gaetano Carbonara", "Jack Cook", "Nicholas Gallagher"];

// ─── Shared CSS (GCF / Heritage Lounge design system) ───────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

  :root {
    --gc-gold: #C4975A;
    --gc-gold-bright: #D4A55A;
    --gc-maroon: #5C1C28;
    --gc-maroon-deep: #3A0E18;
    --gc-platinum: #D9D6D0;
    --gc-text: #2D1810;
    --gc-text-secondary: #6B5548;
    --gc-text-muted: #8A7060;
    --gc-paper: #FBF8F2;
    --gc-surface: #F5EEE6;
    --gc-surface-2: #EDE4D8;
    --gc-border: rgba(74, 20, 32, 0.18);
    --gc-border-subtle: rgba(74, 20, 32, 0.08);
    --gc-font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
    --gc-font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  }

  @page {
    size: letter;
    margin: 0.85in 0.95in 1in 0.95in;
    @bottom-left {
      content: "GOLD COAST FINANCIAL PARTNERS LLC";
      font-family: 'DM Sans', sans-serif;
      font-size: 7.5pt;
      letter-spacing: 0.18em;
      color: #8A7060;
    }
    @bottom-center {
      content: counter(page) " / " counter(pages);
      font-family: 'DM Sans', sans-serif;
      font-size: 7.5pt;
      letter-spacing: 0.10em;
      color: #8A7060;
    }
    @bottom-right {
      content: "CONFIDENTIAL · v1.0";
      font-family: 'DM Sans', sans-serif;
      font-size: 7.5pt;
      letter-spacing: 0.18em;
      color: #8A7060;
    }
  }

  html { background: #E5E0D5; }
  body {
    font-family: var(--gc-font-body);
    font-size: 10.5pt;
    line-height: 1.65;
    color: var(--gc-text);
    margin: 0;
    padding: 0;
    background: #E5E0D5;
    -webkit-font-smoothing: antialiased;
    font-feature-settings: "kern" 1, "liga" 1, "tnum" 1;
  }
  .page {
    background: white;
    width: 8.5in;
    min-height: 11in;
    margin: 0.4in auto;
    padding: 0.85in 0.95in 1in 0.95in;
    box-shadow: 0 6px 28px rgba(74, 20, 32, 0.18), 0 0 1px rgba(74, 20, 32, 0.12);
    border-radius: 2px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  @media print {
    html, body { background: white; }
    .page {
      margin: 0;
      width: 100%;
      min-height: 0;
      padding: 0;
      box-shadow: none;
      border-radius: 0;
      overflow: visible;
      display: block;
    }
  }

  /* ─── COVER PAGE ─────────────────────────────────────────── */
  .page-cover { page-break-after: always; break-after: page; }
  .page-body { page-break-after: always; break-after: page; }
  .cover {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .cover-spacer { flex: 1 1 auto; min-height: 0.5in; }
  .cover-rule-top {
    height: 4px;
    background: linear-gradient(90deg, var(--gc-maroon) 0%, var(--gc-gold) 50%, var(--gc-maroon) 100%);
    margin-bottom: 0.05in;
  }
  .cover-rule-platinum {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gc-platinum), transparent);
    margin-bottom: 0.6in;
  }
  .cover-eyebrow {
    font-family: var(--gc-font-body);
    font-size: 8.5pt;
    font-weight: 500;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--gc-maroon);
    margin-bottom: 0.18in;
  }
  .cover-monogram {
    display: inline-block;
    font-family: var(--gc-font-display);
    font-style: italic;
    font-weight: 600;
    font-size: 24pt;
    color: var(--gc-gold);
    line-height: 1;
    border-bottom: 2px solid var(--gc-gold);
    padding-bottom: 4pt;
    margin-bottom: 0.55in;
    letter-spacing: 0.04em;
  }
  .cover-entity {
    font-family: var(--gc-font-display);
    font-weight: 500;
    font-size: 16pt;
    color: var(--gc-text);
    line-height: 1.2;
    letter-spacing: -0.005em;
    margin-bottom: 0.05in;
  }
  .cover-entity-sub {
    font-family: var(--gc-font-body);
    font-size: 9pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gc-text-muted);
    margin-bottom: 0.85in;
  }
  .cover-kind {
    font-family: var(--gc-font-body);
    font-size: 10pt;
    font-weight: 500;
    letter-spacing: 0.30em;
    text-transform: uppercase;
    color: var(--gc-maroon);
    margin-bottom: 0.18in;
  }
  .cover-title {
    font-family: var(--gc-font-display);
    font-weight: 600;
    font-size: 44pt;
    color: var(--gc-text);
    line-height: 1.04;
    letter-spacing: -0.018em;
    margin-bottom: 0.28in;
    max-width: 6.5in;
  }
  .cover-subtitle {
    font-family: var(--gc-font-display);
    font-style: italic;
    font-weight: 400;
    font-size: 14pt;
    color: var(--gc-text-secondary);
    line-height: 1.45;
    max-width: 5.4in;
    margin-bottom: 0.7in;
  }
  .cover-accent {
    width: 1.4in;
    height: 2px;
    background: linear-gradient(90deg, var(--gc-gold), var(--gc-maroon));
    margin-bottom: 0.45in;
  }
  .cover-meta {
    border-left: 2px solid var(--gc-gold);
    padding: 0.05in 0 0.05in 0.28in;
    font-family: var(--gc-font-body);
    font-size: 9.5pt;
    color: var(--gc-text-secondary);
    line-height: 1.85;
    max-width: 4.8in;
  }
  .cover-meta-row {
    display: flex;
    gap: 0.18in;
  }
  .cover-meta-label {
    font-size: 7.5pt;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gc-text-muted);
    width: 1.45in;
    flex-shrink: 0;
    padding-top: 2pt;
  }
  .cover-meta-value {
    color: var(--gc-text);
    font-weight: 400;
  }
  .cover-meta-value strong {
    color: var(--gc-text);
    font-weight: 600;
  }
  .cover-confidentiality {
    margin-top: auto;
    padding-top: 0.18in;
    border-top: 1px solid var(--gc-border-subtle);
    font-family: var(--gc-font-body);
    font-size: 7.5pt;
    line-height: 1.55;
    color: var(--gc-text-muted);
    letter-spacing: 0.02em;
  }
  .cover-confidentiality strong {
    font-size: 7.5pt;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gc-maroon);
    display: block;
    margin-bottom: 4pt;
  }

  /* ─── SECTION HEADER (each page top) ─────────────────────── */
  main { display: block; }
  .section-header {
    border-bottom: 1px solid var(--gc-border-subtle);
    padding: 0.2in 0 0.12in 0;
    margin-bottom: 0.32in;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .section-header-brand {
    font-family: var(--gc-font-display);
    font-style: italic;
    font-weight: 500;
    font-size: 11pt;
    color: var(--gc-gold);
  }
  .section-header-doc {
    font-family: var(--gc-font-body);
    font-size: 8pt;
    letter-spacing: 0.20em;
    text-transform: uppercase;
    color: var(--gc-text-muted);
    font-weight: 500;
  }

  /* ─── BODY ───────────────────────────────────────────────── */
  main { padding: 0; }
  main > h1:first-of-type {
    margin-top: 0;
  }

  h1 {
    font-family: var(--gc-font-display);
    font-weight: 600;
    font-size: 24pt;
    color: var(--gc-text);
    line-height: 1.15;
    letter-spacing: -0.012em;
    margin: 0.45in 0 0.18in 0;
    padding-bottom: 0.1in;
    border-bottom: 1px solid var(--gc-border);
    position: relative;
  }
  h1::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 0.9in;
    height: 2px;
    background: linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright));
  }
  h2 {
    font-family: var(--gc-font-display);
    font-weight: 600;
    font-size: 15pt;
    color: var(--gc-text);
    line-height: 1.25;
    letter-spacing: -0.005em;
    margin: 0.34in 0 0.12in 0;
  }
  h3 {
    font-family: var(--gc-font-body);
    font-weight: 600;
    font-size: 10.5pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gc-maroon);
    margin: 0.24in 0 0.08in 0;
  }
  h4 {
    font-family: var(--gc-font-body);
    font-weight: 600;
    font-size: 10.5pt;
    color: var(--gc-text);
    margin: 0.18in 0 0.06in 0;
  }
  p { margin: 0.08in 0; }
  ul, ol {
    margin: 0.1in 0 0.16in 0.32in;
    padding: 0;
  }
  li {
    margin: 0.05in 0;
    padding-left: 0.06in;
  }
  ul li::marker { color: var(--gc-gold); }
  ol li::marker {
    color: var(--gc-gold);
    font-family: var(--gc-font-display);
    font-weight: 600;
  }
  strong {
    color: var(--gc-text);
    font-weight: 600;
  }
  em { color: var(--gc-text-secondary); }
  a {
    color: var(--gc-maroon);
    text-decoration: none;
    border-bottom: 1px solid rgba(196, 151, 90, 0.4);
  }

  blockquote {
    margin: 0.18in 0;
    padding: 0.12in 0.22in;
    background: var(--gc-surface);
    border-left: 3px solid var(--gc-gold);
    color: var(--gc-text-secondary);
    font-family: var(--gc-font-display);
    font-style: italic;
    font-size: 10.5pt;
    line-height: 1.6;
    border-radius: 0 4px 4px 0;
  }
  blockquote strong { color: var(--gc-maroon); }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.18in 0;
    font-size: 9.5pt;
    line-height: 1.5;
    page-break-inside: avoid;
  }
  thead {
    border-bottom: 2px solid var(--gc-gold);
  }
  th {
    text-align: left;
    padding: 8pt 10pt;
    font-family: var(--gc-font-body);
    font-weight: 600;
    font-size: 8pt;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gc-maroon);
    border-bottom: none;
    vertical-align: bottom;
  }
  td {
    padding: 8pt 10pt;
    border-bottom: 1px solid var(--gc-border-subtle);
    vertical-align: top;
    color: var(--gc-text);
  }
  tbody tr:nth-child(even) td {
    background: rgba(245, 238, 230, 0.4);
  }

  code {
    font-family: 'SF Mono', 'Menlo', 'Courier New', monospace;
    font-size: 8.5pt;
    background: var(--gc-surface);
    color: var(--gc-maroon);
    padding: 1pt 5pt;
    border-radius: 3px;
    border: 1px solid var(--gc-border-subtle);
  }
  pre {
    font-family: 'SF Mono', 'Menlo', 'Courier New', monospace;
    font-size: 8.5pt;
    line-height: 1.55;
    background: var(--gc-surface);
    border-left: 3px solid var(--gc-gold);
    border-radius: 0 4px 4px 0;
    padding: 12pt 14pt;
    overflow-x: auto;
    color: var(--gc-text);
    margin: 0.18in 0;
  }
  pre code {
    background: transparent;
    border: none;
    padding: 0;
    color: inherit;
  }

  hr {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gc-border), transparent);
    margin: 0.32in 0;
  }

  /* Checkboxes (markdown task list items) */
  input[type="checkbox"] {
    accent-color: var(--gc-gold);
    margin-right: 6pt;
    transform: translateY(1px);
  }

  /* ─── ADOPTION / SIGNATURE BLOCK ─────────────────────────── */
  .sig {
    padding-top: 0.2in;
  }
  .sig-rule {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gc-platinum), transparent);
    margin-bottom: 0.18in;
  }
  .sig-eyebrow {
    font-family: var(--gc-font-body);
    font-size: 8pt;
    font-weight: 500;
    letter-spacing: 0.30em;
    text-transform: uppercase;
    color: var(--gc-maroon);
    margin-bottom: 0.1in;
  }
  .sig-heading {
    font-family: var(--gc-font-display);
    font-weight: 600;
    font-size: 26pt;
    color: var(--gc-text);
    line-height: 1.1;
    letter-spacing: -0.01em;
    margin-bottom: 0.04in;
  }
  .sig-heading::after {
    content: "";
    display: block;
    width: 0.8in;
    height: 2px;
    background: linear-gradient(90deg, var(--gc-gold), var(--gc-maroon));
    margin-top: 0.12in;
  }
  .sig-lede {
    font-family: var(--gc-font-display);
    font-style: italic;
    font-size: 12pt;
    color: var(--gc-text-secondary);
    line-height: 1.55;
    margin: 0.2in 0 0.5in 0;
    max-width: 5.6in;
  }
  .sig-block {
    margin-top: 0.55in;
    padding: 0.32in 0.34in 0.28in 0.34in;
    border: 1px solid var(--gc-border);
    border-left: 3px solid var(--gc-gold);
    border-radius: 0 6px 6px 0;
    background: linear-gradient(180deg, rgba(251, 248, 242, 0.6), white);
    page-break-inside: avoid;
  }
  .sig-block-label {
    font-family: var(--gc-font-body);
    font-size: 8pt;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gc-text-muted);
    margin-bottom: 0.32in;
  }
  .sig-line {
    border-bottom: 1.5px solid var(--gc-text);
    height: 0.5in;
    margin-bottom: 6pt;
  }
  .sig-caption {
    font-family: var(--gc-font-body);
    font-size: 9pt;
    color: var(--gc-text-secondary);
    line-height: 1.5;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.3in;
  }
  .sig-caption .name {
    font-family: var(--gc-font-display);
    font-style: italic;
    font-weight: 500;
    font-size: 11pt;
    color: var(--gc-text);
  }
  .sig-caption .role {
    font-family: var(--gc-font-body);
    font-size: 8pt;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gc-text-muted);
  }
  .sig-row {
    display: flex;
    gap: 0.5in;
    margin-top: 0.25in;
  }
  .sig-row > div { flex: 1; }
  .sig-row .field-label {
    font-family: var(--gc-font-body);
    font-size: 7.5pt;
    font-weight: 500;
    letter-spacing: 0.20em;
    text-transform: uppercase;
    color: var(--gc-text-muted);
    margin-bottom: 0.04in;
  }
  .sig-row .field-line {
    border-bottom: 1px solid var(--gc-text-muted);
    height: 0.28in;
  }

  .closing-attest {
    margin-top: 0.5in;
    padding: 0.22in 0.26in;
    background: var(--gc-surface);
    border-left: 3px solid var(--gc-maroon);
    border-radius: 0 4px 4px 0;
    font-family: var(--gc-font-body);
    font-size: 8.5pt;
    line-height: 1.6;
    color: var(--gc-text-secondary);
    page-break-inside: avoid;
  }
  .closing-attest strong {
    display: block;
    font-size: 7.5pt;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gc-maroon);
    margin-bottom: 5pt;
  }
`;

// ─── HTML template ────────────────────────────────────────────────────────
function template({ title, version, kind, body, acknowledger, isAck, founderName }) {
  const sigBlock = isAck
    ? `
      <section class="sig">
        <div class="sig-rule"></div>
        <div class="sig-eyebrow">Execution</div>
        <h1 class="sig-heading">Acknowledgement &amp; Signatures</h1>
        <p class="sig-lede">
          By countersigning below, both parties affirm that this acknowledgement
          has been executed in good faith and shall remain on file as part of
          the company's information security program records.
        </p>

        <div class="sig-block">
          <div class="sig-block-label">Operator Signature</div>
          <div class="sig-line"></div>
          <div class="sig-caption">
            <div>
              <span class="name">${escapeHtml(founderName)}</span>
              <span class="role" style="margin-left: 10pt;">Founder</span>
            </div>
          </div>
          <div class="sig-row">
            <div>
              <div class="field-label">Date</div>
              <div class="field-line"></div>
            </div>
            <div>
              <div class="field-label">Place of Execution</div>
              <div class="field-line"></div>
            </div>
          </div>
        </div>

        <div class="sig-block">
          <div class="sig-block-label">Counter-signature · Qualified Individual</div>
          <div class="sig-line"></div>
          <div class="sig-caption">
            <div>
              <span class="name">________________________________</span>
              <span class="role" style="margin-left: 10pt;">Qualified Individual, GLBA Safeguards Rule</span>
            </div>
          </div>
          <div class="sig-row">
            <div>
              <div class="field-label">Date</div>
              <div class="field-line"></div>
            </div>
            <div>
              <div class="field-label">Place of Execution</div>
              <div class="field-line"></div>
            </div>
          </div>
        </div>

        <div class="closing-attest">
          <strong>Attestation</strong>
          The signatory affirms that they have read this acknowledgement in
          full, understand each obligation listed, and consent to compliance
          with all referenced policies as a continuing condition of access to
          Gold Coast Financial Partners LLC information systems and data.
          Violations may result in revocation of access, termination, and
          civil or criminal referral.
        </div>
      </section>`
    : `
      <section class="sig">
        <div class="sig-rule"></div>
        <div class="sig-eyebrow">Adoption &amp; Authority</div>
        <h1 class="sig-heading">Executed and Made Effective</h1>
        <p class="sig-lede">
          This document is hereby adopted and made effective as of the date
          set forth below, by and on behalf of Gold Coast Financial
          Partners LLC, a Florida limited liability company.
        </p>

        <div class="sig-block">
          <div class="sig-block-label">Authorized Signatory</div>
          <div class="sig-line"></div>
          <div class="sig-caption">
            <div>
              <span class="name">${escapeHtml(acknowledger)}</span>
              <span class="role" style="margin-left: 10pt;">Founder · Gold Coast Financial Partners LLC</span>
            </div>
          </div>
          <div class="sig-row">
            <div>
              <div class="field-label">Date</div>
              <div class="field-line"></div>
            </div>
            <div>
              <div class="field-label">Place of Execution</div>
              <div class="field-line"></div>
            </div>
          </div>
        </div>

        <div class="closing-attest">
          <strong>Statement of Authority</strong>
          The undersigned, in their capacity as a Founder and the Qualified
          Individual designated under 16 CFR § 314.4(a), hereby adopts this
          ${escapeHtml(kind)} on behalf of Gold Coast Financial Partners
          LLC and certifies that it shall govern the operations and
          information systems of the Company until amended in writing.
        </div>
      </section>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Gold Coast Financial Partners LLC · ${escapeHtml(title)}</title>
<style>${STYLES}</style>
</head>
<body>
  <article class="page page-cover">
    <div class="cover">
      <div class="cover-rule-top"></div>
      <div class="cover-rule-platinum"></div>

      <div class="cover-eyebrow">Gold Coast · Information Security Program</div>
      <div class="cover-monogram">G C F</div>

      <div class="cover-entity">Gold Coast Financial Partners LLC</div>
      <div class="cover-entity-sub">Heritage Life Solutions · Florida LLC</div>

      <div class="cover-spacer"></div>

      <div class="cover-kind">${escapeHtml(kind)}</div>
      <h1 class="cover-title">${escapeHtml(title)}</h1>
      <p class="cover-subtitle">
        ${
          isAck
            ? "Operator acknowledgement of, and binding commitment to, the policies, runbooks, and program documents of the Company's Information Security Program."
            : kindSubtitle(kind, title)
        }
      </p>

      <div class="cover-accent"></div>

      <div class="cover-meta">
        <div class="cover-meta-row">
          <div class="cover-meta-label">Document Version</div>
          <div class="cover-meta-value"><strong>v${escapeHtml(version)}</strong></div>
        </div>
        <div class="cover-meta-row">
          <div class="cover-meta-label">Effective Date</div>
          <div class="cover-meta-value">${escapeHtml(TODAY)}</div>
        </div>
        <div class="cover-meta-row">
          <div class="cover-meta-label">Owner of Record</div>
          <div class="cover-meta-value">Qualified Individual · 16 CFR § 314.4(a)</div>
        </div>
        <div class="cover-meta-row">
          <div class="cover-meta-label">Review Cadence</div>
          <div class="cover-meta-value">Annually, plus on any material change</div>
        </div>
        <div class="cover-meta-row">
          <div class="cover-meta-label">Classification</div>
          <div class="cover-meta-value"><strong>Confidential</strong> — internal use only</div>
        </div>
      </div>

      <div class="cover-confidentiality">
        <strong>Confidentiality Notice</strong>
        This document is the proprietary and confidential information of Gold
        Coast Financial Partners LLC. It contains policies and operational
        procedures developed in support of the Company's information security
        program under the Gramm-Leach-Bliley Act Safeguards Rule (16 CFR
        Part 314). Distribution is restricted to operators with a legitimate
        business need. Unauthorized disclosure may result in civil or
        criminal liability.
      </div>
    </div>
  </article>

  <article class="page page-body">
    <main>
      <div class="section-header">
        <div class="section-header-brand">Gold Coast Financial Partners</div>
        <div class="section-header-doc">${escapeHtml(kind)} · v${escapeHtml(version)}</div>
      </div>
      ${body}
    </main>
  </article>

  <article class="page page-sig">
    ${sigBlock}
  </article>
</body>
</html>`;
}

function kindSubtitle(kind, title) {
  if (kind === "ISP") {
    return "The Company's written information security program, prescribing the controls, governance, and oversight required to safeguard non-public personal information under federal and state law.";
  }
  if (kind === "Acknowledgement") {
    return "Operator acknowledgement of and binding commitment to the policies of the Company's Information Security Program.";
  }
  return `Formal policy of Gold Coast Financial Partners LLC, governing operator conduct and operational controls within the scope of ${title.toLowerCase()}.`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

// ─── Build ───────────────────────────────────────────────────────────────
fs.mkdirSync(OUT, { recursive: true });

function renderMd(md) {
  marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });
  return marked.parse(md);
}

for (const [slug, title, kind, version, acknowledger] of DOCS) {
  const src = SOURCES[slug];
  const md = fs.readFileSync(src, "utf8");
  const body = renderMd(md);
  const html = template({ title, version, kind, body, acknowledger });
  fs.writeFileSync(path.join(OUT, `${slug}.html`), html);
  console.log(`wrote ${slug}.html`);
}

const ackMd = fs.readFileSync(ACK_SRC, "utf8");
const ackHtmlBody = renderMd(ackMd);
for (const founder of FOUNDERS) {
  const slug = `10-acknowledgement-${founder.toLowerCase().split(" ")[0]}`;
  const html = template({
    title: `Policy Acknowledgement — ${founder}`,
    version: "1.0",
    kind: "Acknowledgement",
    body: ackHtmlBody,
    isAck: true,
    founderName: founder,
  });
  fs.writeFileSync(path.join(OUT, `${slug}.html`), html);
  console.log(`wrote ${slug}.html`);
}

// ─── INDEX ─────────────────────────────────────────────────────────────
const index = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Gold Coast Financial Partners LLC · Documents to Sign</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  :root {
    --gc-gold: #C4975A;
    --gc-gold-bright: #D4A55A;
    --gc-maroon: #5C1C28;
    --gc-platinum: #D9D6D0;
    --gc-text: #2D1810;
    --gc-text-secondary: #6B5548;
    --gc-text-muted: #8A7060;
    --gc-paper: #FBF8F2;
    --gc-surface: #F5EEE6;
    --gc-border: rgba(74, 20, 32, 0.18);
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--gc-paper);
    color: var(--gc-text);
    margin: 0;
    padding: 0;
    line-height: 1.6;
  }
  .wrap {
    max-width: 760px;
    margin: 0 auto;
    padding: 64px 48px 96px;
  }
  .top-rule {
    height: 4px;
    background: linear-gradient(90deg, var(--gc-maroon), var(--gc-gold), var(--gc-maroon));
    margin-bottom: 1px;
  }
  .top-rule-2 {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gc-platinum), transparent);
    margin-bottom: 56px;
  }
  .eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.30em;
    text-transform: uppercase;
    color: var(--gc-maroon);
    margin-bottom: 12px;
  }
  .monogram {
    display: inline-block;
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 600;
    font-size: 28px;
    color: var(--gc-gold);
    border-bottom: 2px solid var(--gc-gold);
    padding-bottom: 4px;
    line-height: 1;
    margin-bottom: 32px;
  }
  h1 {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 44px;
    line-height: 1.05;
    letter-spacing: -0.018em;
    margin: 0 0 12px 0;
  }
  .subtitle {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 18px;
    color: var(--gc-text-secondary);
    line-height: 1.5;
    margin: 0 0 48px 0;
    max-width: 560px;
  }
  .accent {
    width: 80px;
    height: 2px;
    background: linear-gradient(90deg, var(--gc-gold), var(--gc-maroon));
    margin: 0 0 56px 0;
  }
  h2 {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 22px;
    color: var(--gc-text);
    margin: 56px 0 8px 0;
    letter-spacing: -0.005em;
  }
  h2::after {
    content: "";
    display: block;
    width: 56px;
    height: 2px;
    background: var(--gc-gold);
    margin-top: 12px;
    margin-bottom: 20px;
  }
  ol.docs {
    list-style: none;
    padding: 0;
    counter-reset: doc;
  }
  ol.docs li {
    counter-increment: doc;
    padding: 18px 24px;
    border: 1px solid var(--gc-border);
    border-left: 3px solid var(--gc-gold);
    border-radius: 0 6px 6px 0;
    margin-bottom: 12px;
    background: white;
    transition: border-color 200ms ease, transform 200ms ease;
    position: relative;
    display: flex;
    align-items: center;
    gap: 18px;
  }
  ol.docs li:hover {
    border-color: var(--gc-maroon);
    border-left-color: var(--gc-maroon);
    transform: translateX(2px);
  }
  ol.docs li::before {
    content: counter(doc, decimal-leading-zero);
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 600;
    font-size: 26px;
    color: var(--gc-gold);
    line-height: 1;
    flex-shrink: 0;
    width: 38px;
  }
  .doc-content { flex: 1; min-width: 0; }
  .doc-title {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 17px;
    color: var(--gc-text);
    line-height: 1.3;
    margin-bottom: 4px;
  }
  .doc-title a {
    color: inherit;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 150ms ease;
  }
  .doc-title a:hover { border-bottom-color: var(--gc-gold); }
  .doc-meta {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gc-text-muted);
  }
  .ack-list {
    list-style: none;
    padding: 0;
  }
  .ack-list li {
    padding: 16px 22px;
    background: white;
    border: 1px solid var(--gc-border);
    border-radius: 6px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 200ms ease;
  }
  .ack-list li:hover {
    border-color: var(--gc-maroon);
    transform: translateX(2px);
  }
  .ack-list .ack-name {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 500;
    font-size: 16px;
    color: var(--gc-text);
  }
  .ack-list .ack-name a {
    color: inherit;
    text-decoration: none;
  }
  .ack-list .ack-name a:hover { color: var(--gc-maroon); }
  .ack-list .ack-tag {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.20em;
    text-transform: uppercase;
    color: var(--gc-gold);
    padding: 4px 10px;
    border: 1px solid var(--gc-gold);
    border-radius: 999px;
  }
  .filing {
    margin-top: 56px;
    padding: 24px 28px;
    background: var(--gc-surface);
    border-left: 3px solid var(--gc-maroon);
    border-radius: 0 6px 6px 0;
  }
  .filing-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--gc-maroon);
    margin-bottom: 10px;
  }
  .filing-title {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 18px;
    color: var(--gc-text);
    margin-bottom: 12px;
  }
  .filing ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
    font-size: 13px;
    color: var(--gc-text-secondary);
  }
  .filing code {
    font-family: 'SF Mono', Menlo, monospace;
    font-size: 11px;
    background: white;
    color: var(--gc-maroon);
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid var(--gc-border);
  }
  footer {
    margin-top: 72px;
    padding-top: 24px;
    border-top: 1px solid var(--gc-border);
    font-size: 11px;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: var(--gc-text-muted);
    text-align: center;
  }
</style>
</head>
<body>
<div class="top-rule"></div>
<div class="top-rule-2"></div>
<div class="wrap">
  <div class="eyebrow">Gold Coast · Information Security Program</div>
  <div class="monogram">G C F</div>
  <h1>Documents to Sign</h1>
  <p class="subtitle">
    A complete legal pack supporting the Company's Gramm-Leach-Bliley
    Act Safeguards Rule program. Open each document, print to PDF, and
    countersign per the filing instructions below.
  </p>
  <div class="accent"></div>

  <h2>Policies &amp; Program</h2>
  <ol class="docs">
${DOCS.map(([slug, title, kind, version]) => `    <li>
      <div class="doc-content">
        <div class="doc-title"><a href="${slug}.html">${title}</a></div>
        <div class="doc-meta">${kind} · v${version}</div>
      </div>
    </li>`).join("\n")}
  </ol>

  <h2>Founder Acknowledgements</h2>
  <ul class="ack-list">
${FOUNDERS.map((f) => {
  const slug = `10-acknowledgement-${f.toLowerCase().split(" ")[0]}`;
  return `    <li>
      <div class="ack-name"><a href="${slug}.html">${f}</a></div>
      <div class="ack-tag">Per-founder signature</div>
    </li>`;
}).join("\n")}
  </ul>

  <div class="filing">
    <div class="filing-eyebrow">Filing Instructions</div>
    <div class="filing-title">Where signed PDFs go</div>
    <ul>
      <li>Documents 01–09: <code>/Users/guy4carbs/gcf/Security/Policies/</code></li>
      <li>Acknowledgements: <code>/Users/guy4carbs/gcf/Security/Acknowledgements/</code></li>
    </ul>
  </div>

  <footer>
    Gold Coast Financial Partners LLC · Heritage Life Solutions · Confidential
  </footer>
</div>
</body>
</html>`;
fs.writeFileSync(path.join(OUT, "INDEX.html"), index);
console.log(`wrote INDEX.html`);

console.log(`\nDone. Output: ${OUT}`);
