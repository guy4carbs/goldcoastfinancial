/**
 * Debate Manuscript PDF Service
 *
 * Generates professional PDF manuscripts from completed debates.
 * Structured like a formal research paper or court proceeding document.
 * Supports 2-4 participants.
 */

import PDFDocument from "pdfkit";
import type { ComprehensiveDebateSummary, DebateTurn } from "../../shared/models/avatarCouncil";

// =============================================================================
// Types
// =============================================================================

interface ManuscriptOptions {
  includeThinking?: boolean;
  includeMetrics?: boolean;
  documentNumber?: string;
}

interface ParticipantInfo {
  id: string;
  name: string;
  slug: string;
  designation: string; // "Participant A", "Participant B", etc.
  color: string;
  turns: number;
  tokens: number;
}

// =============================================================================
// Constants
// =============================================================================

const COLORS = {
  primary: "#1a365d",    // Navy blue - formal
  secondary: "#2d3748",  // Dark gray
  accent: "#744210",     // Brown/gold - official
  text: "#1a202c",       // Near black
  muted: "#4a5568",      // Gray
  light: "#e2e8f0",      // Light gray
  white: "#ffffff",
  black: "#000000",
  border: "#cbd5e0",
};

const AVATAR_COLORS: Record<string, string> = {
  "warren-buffett": "#B45309",
  "patrick-bet-david": "#0E7490",
  "ben-feldman": "#6D28D9",
  "elizur-wright": "#047857",
  "jordan-belfort": "#B91C1C",
  "andy-elliott": "#C2410C",
  "andrew-tate": "#9F1239",
};

const PARTICIPANT_DESIGNATIONS = ["A", "B", "C", "D"];

// =============================================================================
// Helper Functions
// =============================================================================

function getParticipantColor(slug: string, index: number): string {
  return AVATAR_COLORS[slug] || ["#1e40af", "#7c2d12", "#065f46", "#7c3aed"][index] || "#374151";
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs} second${secs !== 1 ? "s" : ""}`;
  return `${mins} minute${mins !== 1 ? "s" : ""} ${secs > 0 ? `${secs} seconds` : ""}`.trim();
}

function formatDateFormal(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function generateDocumentNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `AC-${year}-${seq}`;
}

function romanNumeral(num: number): string {
  const numerals: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let result = "";
  for (const [value, symbol] of numerals) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}

// =============================================================================
// PDF Generation
// =============================================================================

export async function generateDebateManuscript(
  summary: ComprehensiveDebateSummary,
  options: ManuscriptOptions = {}
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const documentNumber = options.documentNumber || generateDocumentNumber();

      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        info: {
          Title: `Official Debate Transcript: ${summary.topic}`,
          Author: "Avatar Council - GCF Insurance Platform",
          Subject: "Expert Panel Debate Proceedings",
          Keywords: "debate, transcript, expert analysis, insurance",
          Creator: "Avatar Council Document System",
        },
        bufferPages: true,
      });

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Build participant info from summary - support multiple participants
      const participants: ParticipantInfo[] = [];

      // Add avatar1 and avatar2 (always present)
      if (summary.avatar1) {
        participants.push({
          id: summary.avatar1.id,
          name: summary.avatar1.name,
          slug: summary.avatar1.slug,
          designation: `Participant ${PARTICIPANT_DESIGNATIONS[0]}`,
          color: getParticipantColor(summary.avatar1.slug, 0),
          turns: summary.avatar1.totalTurns || 0,
          tokens: summary.avatar1.totalTokens || 0,
        });
      }

      if (summary.avatar2) {
        participants.push({
          id: summary.avatar2.id,
          name: summary.avatar2.name,
          slug: summary.avatar2.slug,
          designation: `Participant ${PARTICIPANT_DESIGNATIONS[1]}`,
          color: getParticipantColor(summary.avatar2.slug, 1),
          turns: summary.avatar2.totalTurns || 0,
          tokens: summary.avatar2.totalTokens || 0,
        });
      }

      // Check for additional participants in transcript
      if (summary.transcript) {
        const allTurns = summary.transcript.flatMap(p => p.turns || []);
        const uniqueAvatars = new Map<string, DebateTurn>();
        for (const turn of allTurns) {
          if (!uniqueAvatars.has(turn.avatarId) &&
              !participants.find(p => p.id === turn.avatarId)) {
            uniqueAvatars.set(turn.avatarId, turn);
          }
        }

        // Add additional participants
        let idx = participants.length;
        for (const [avatarId, turn] of uniqueAvatars) {
          if (idx < 4) {
            const avatarTurns = allTurns.filter(t => t.avatarId === avatarId);
            participants.push({
              id: avatarId,
              name: turn.avatarName,
              slug: turn.avatarSlug,
              designation: `Participant ${PARTICIPANT_DESIGNATIONS[idx]}`,
              color: getParticipantColor(turn.avatarSlug, idx),
              turns: avatarTurns.length,
              tokens: avatarTurns.reduce((sum, t) => sum + (t.tokensUsed || 0), 0),
            });
            idx++;
          }
        }
      }

      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 144;

      // =========================================================================
      // TITLE PAGE
      // =========================================================================
      renderTitlePage(doc, summary, documentNumber, participants);

      // =========================================================================
      // TABLE OF CONTENTS
      // =========================================================================
      doc.addPage();
      renderTableOfContents(doc, participants.length);

      // =========================================================================
      // I. PRELIMINARY STATEMENT
      // =========================================================================
      doc.addPage();
      renderPreliminaryStatement(doc, summary, documentNumber, participants);

      // =========================================================================
      // II. PARTIES TO THE PROCEEDING
      // =========================================================================
      doc.addPage();
      renderPartiesSection(doc, participants);

      // =========================================================================
      // III. EXECUTIVE SUMMARY
      // =========================================================================
      doc.addPage();
      renderExecutiveSummary(doc, summary);

      // =========================================================================
      // IV. VERBATIM TRANSCRIPT
      // =========================================================================
      doc.addPage();
      renderTranscript(doc, summary, participants);

      // =========================================================================
      // V. POSITION ANALYSIS
      // =========================================================================
      doc.addPage();
      renderPositionAnalysis(doc, summary, participants);

      // =========================================================================
      // VI. FINDINGS AND CONCLUSIONS
      // =========================================================================
      doc.addPage();
      renderFindings(doc, summary, participants);

      // =========================================================================
      // VII. CERTIFICATION
      // =========================================================================
      doc.addPage();
      renderCertification(doc, summary, documentNumber);

      // =========================================================================
      // APPENDIX (Optional)
      // =========================================================================
      if (options.includeMetrics) {
        doc.addPage();
        renderAppendix(doc, summary, participants);
      }

      // Add page numbers and headers
      addPageNumbersAndHeaders(doc, documentNumber);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// =============================================================================
// Page Renderers
// =============================================================================

function renderTitlePage(
  doc: PDFKit.PDFDocument,
  summary: ComprehensiveDebateSummary,
  documentNumber: string,
  participants: ParticipantInfo[]
) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const centerX = pageWidth / 2;

  // Top border line
  doc.moveTo(72, 60).lineTo(pageWidth - 72, 60).lineWidth(2).stroke(COLORS.primary);
  doc.moveTo(72, 64).lineTo(pageWidth - 72, 64).lineWidth(0.5).stroke(COLORS.primary);

  // Institution header
  doc.fillColor(COLORS.primary)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("AVATAR COUNCIL", 72, 85, { align: "center", width: pageWidth - 144 });

  doc.fillColor(COLORS.muted)
    .fontSize(9)
    .font("Helvetica")
    .text("Expert Advisory Panel • GCF Insurance Platform", 72, 100, { align: "center", width: pageWidth - 144 });

  // Document type
  doc.fillColor(COLORS.text)
    .fontSize(10)
    .font("Helvetica")
    .text("─────────────────────────────────────────", 72, 130, { align: "center", width: pageWidth - 144 });

  doc.fontSize(14)
    .font("Helvetica-Bold")
    .text("OFFICIAL DEBATE TRANSCRIPT", 72, 150, { align: "center", width: pageWidth - 144 });

  doc.fontSize(10)
    .font("Helvetica")
    .text("AND PROCEEDINGS RECORD", 72, 168, { align: "center", width: pageWidth - 144 });

  doc.text("─────────────────────────────────────────", 72, 188, { align: "center", width: pageWidth - 144 });

  // Document number
  doc.fillColor(COLORS.muted)
    .fontSize(10)
    .text(`Document No. ${documentNumber}`, 72, 215, { align: "center", width: pageWidth - 144 });

  // Main title box
  const titleBoxY = 260;
  doc.rect(72, titleBoxY, pageWidth - 144, 80)
    .fillAndStroke("#f8fafc", COLORS.border);

  doc.fillColor(COLORS.muted)
    .fontSize(9)
    .font("Helvetica")
    .text("IN THE MATTER OF:", 72, titleBoxY + 15, { align: "center", width: pageWidth - 144 });

  doc.fillColor(COLORS.text)
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(`"${summary.topic}"`, 82, titleBoxY + 35, {
      align: "center",
      width: pageWidth - 164,
      lineGap: 2
    });

  // Parties
  const partiesY = 370;
  doc.fillColor(COLORS.muted)
    .fontSize(9)
    .font("Helvetica")
    .text("BETWEEN:", 72, partiesY, { align: "center", width: pageWidth - 144 });

  let partyY = partiesY + 25;
  participants.forEach((p, idx) => {
    if (idx > 0) {
      doc.fillColor(COLORS.muted)
        .fontSize(9)
        .text(idx === participants.length - 1 ? "AND:" : "AND:", 72, partyY, { align: "center", width: pageWidth - 144 });
      partyY += 18;
    }

    doc.fillColor(p.color)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(p.name.toUpperCase(), 72, partyY, { align: "center", width: pageWidth - 144 });

    doc.fillColor(COLORS.muted)
      .fontSize(9)
      .font("Helvetica")
      .text(`(${p.designation})`, 72, partyY + 15, { align: "center", width: pageWidth - 144 });

    partyY += 45;
  });

  // Metadata section
  const metaY = pageHeight - 200;
  doc.moveTo(72, metaY).lineTo(pageWidth - 72, metaY).lineWidth(0.5).stroke(COLORS.border);

  const metaItems = [
    ["Date of Proceeding:", formatDateFormal(summary.generatedAt || new Date().toISOString())],
    ["Total Duration:", formatDuration(summary.totalDuration || 0)],
    ["Total Exchanges:", `${summary.totalTurns || 0} turns`],
    ["Number of Participants:", `${participants.length}`],
  ];

  let metaItemY = metaY + 15;
  for (const [label, value] of metaItems) {
    doc.fillColor(COLORS.muted).fontSize(9).font("Helvetica").text(label, 100, metaItemY);
    doc.fillColor(COLORS.text).font("Helvetica-Bold").text(value, 250, metaItemY);
    metaItemY += 18;
  }

  // Bottom border
  doc.moveTo(72, pageHeight - 60).lineTo(pageWidth - 72, pageHeight - 60).lineWidth(0.5).stroke(COLORS.primary);
  doc.moveTo(72, pageHeight - 56).lineTo(pageWidth - 72, pageHeight - 56).lineWidth(2).stroke(COLORS.primary);

  // Confidentiality notice
  doc.fillColor(COLORS.muted)
    .fontSize(8)
    .font("Helvetica-Oblique")
    .text(
      "This document contains AI-generated content from expert persona simulations.",
      72, pageHeight - 45, { align: "center", width: pageWidth - 144 }
    );
}

function renderTableOfContents(doc: PDFKit.PDFDocument, participantCount: number) {
  const pageWidth = doc.page.width;

  renderSectionHeader(doc, "TABLE OF CONTENTS", 72, false);

  const items = [
    { num: "I.", title: "PRELIMINARY STATEMENT", page: 3 },
    { num: "II.", title: "PARTIES TO THE PROCEEDING", page: 4 },
    { num: "III.", title: "EXECUTIVE SUMMARY", page: 5 },
    { num: "IV.", title: "VERBATIM TRANSCRIPT OF PROCEEDINGS", page: 6 },
    { num: "V.", title: "POSITION ANALYSIS", page: 7 },
    { num: "VI.", title: "FINDINGS AND CONCLUSIONS", page: 8 },
    { num: "VII.", title: "CERTIFICATION", page: 9 },
  ];

  let y = 140;
  for (const item of items) {
    doc.fillColor(COLORS.text)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(item.num, 90, y, { continued: true })
      .font("Helvetica")
      .text(`  ${item.title}`, { continued: false });

    // Dot leader
    const titleEnd = 90 + doc.widthOfString(`${item.num}  ${item.title}`);
    const pageNumStart = pageWidth - 100;
    let dotX = titleEnd + 10;
    doc.fillColor(COLORS.muted).fontSize(10);
    while (dotX < pageNumStart - 10) {
      doc.text(".", dotX, y + 1, { continued: false });
      dotX += 6;
    }

    doc.fillColor(COLORS.text)
      .fontSize(11)
      .font("Helvetica")
      .text(String(item.page), pageNumStart, y, { width: 30, align: "right" });

    y += 28;
  }

  // Subsection indicators
  y += 20;
  doc.fillColor(COLORS.muted)
    .fontSize(9)
    .font("Helvetica-Oblique")
    .text("Note: Page numbers are approximate and may vary based on content length.", 90, y);
}

function renderPreliminaryStatement(
  doc: PDFKit.PDFDocument,
  summary: ComprehensiveDebateSummary,
  documentNumber: string,
  participants: ParticipantInfo[]
) {
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 144;

  renderSectionHeader(doc, "I. PRELIMINARY STATEMENT", 72);

  let y = 140;

  const participantNames = participants.map(p => p.name).join(", ").replace(/, ([^,]*)$/, " and $1");

  doc.fillColor(COLORS.text)
    .fontSize(11)
    .font("Helvetica")
    .text(
      `This document constitutes the official record of debate proceedings conducted under the auspices of the Avatar Council, Document Number ${documentNumber}. The proceeding was convened to address the following matter:`,
      72, y, { width: contentWidth, align: "justify", lineGap: 3 }
    );

  y = doc.y + 20;

  // Topic block quote
  doc.rect(90, y, contentWidth - 36, 50).fill("#f8fafc");
  doc.fillColor(COLORS.primary)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(`"${summary.topic}"`, 100, y + 15, { width: contentWidth - 56, align: "center" });

  y += 70;

  doc.fillColor(COLORS.text)
    .fontSize(11)
    .font("Helvetica")
    .text(
      `The debate was conducted with ${participants.length} expert participants: ${participantNames}. Each participant provided testimony and argumentation within their respective areas of expertise.`,
      72, y, { width: contentWidth, align: "justify", lineGap: 3 }
    );

  y = doc.y + 20;

  doc.text(
    "The following transcript has been prepared from the automated recording of these proceedings. All statements attributed to the participants represent AI-generated responses based on established expert persona profiles.",
    72, y, { width: contentWidth, align: "justify", lineGap: 3 }
  );

  y = doc.y + 30;

  // Proceeding details
  doc.fillColor(COLORS.primary)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("PROCEEDING DETAILS", 72, y);

  y += 20;

  const details = [
    ["Date:", formatDateFormal(summary.generatedAt || new Date().toISOString())],
    ["Duration:", formatDuration(summary.totalDuration || 0)],
    ["Forum:", "Avatar Council Expert Advisory Panel"],
    ["Method:", "AI-Facilitated Structured Debate"],
  ];

  for (const [label, value] of details) {
    doc.fillColor(COLORS.muted).fontSize(10).font("Helvetica").text(label, 90, y);
    doc.fillColor(COLORS.text).font("Helvetica").text(value, 180, y);
    y += 16;
  }
}

function renderPartiesSection(doc: PDFKit.PDFDocument, participants: ParticipantInfo[]) {
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 144;

  renderSectionHeader(doc, "II. PARTIES TO THE PROCEEDING", 72);

  let y = 140;

  doc.fillColor(COLORS.text)
    .fontSize(11)
    .font("Helvetica")
    .text(
      "The following expert advisors participated in the proceeding as designated parties:",
      72, y, { width: contentWidth, lineGap: 3 }
    );

  y = doc.y + 25;

  participants.forEach((participant, index) => {
    // Participant card
    const cardHeight = 90;
    doc.rect(72, y, contentWidth, cardHeight).fillAndStroke("#fafafa", COLORS.border);

    // Color accent bar
    doc.rect(72, y, 5, cardHeight).fill(participant.color);

    // Designation
    doc.fillColor(COLORS.muted)
      .fontSize(9)
      .font("Helvetica")
      .text(participant.designation.toUpperCase(), 90, y + 12);

    // Name
    doc.fillColor(participant.color)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(participant.name, 90, y + 28);

    // Stats
    doc.fillColor(COLORS.muted)
      .fontSize(9)
      .font("Helvetica")
      .text(`Contributions: ${participant.turns} turns`, 90, y + 50)
      .text(`Total Output: ${participant.tokens.toLocaleString()} tokens`, 90, y + 64);

    // Role indicator
    doc.fillColor(COLORS.text)
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text("Expert Advisor", pageWidth - 150, y + 40);

    y += cardHeight + 15;

    // Check for page break
    if (y > doc.page.height - 150 && index < participants.length - 1) {
      doc.addPage();
      y = 72;
    }
  });
}

function renderExecutiveSummary(doc: PDFKit.PDFDocument, summary: ComprehensiveDebateSummary) {
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 144;

  renderSectionHeader(doc, "III. EXECUTIVE SUMMARY", 72);

  let y = 140;

  // A. Overview
  doc.fillColor(COLORS.primary)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("A. Overview of Proceedings", 72, y);

  y += 20;

  doc.fillColor(COLORS.text)
    .fontSize(10)
    .font("Helvetica")
    .text(summary.executiveSummary || "No executive summary available.", 72, y, {
      width: contentWidth,
      align: "justify",
      lineGap: 3,
    });

  y = doc.y + 25;

  // Check for page break
  if (y > doc.page.height - 200) {
    doc.addPage();
    y = 72;
  }

  // B. Key Points of Agreement
  if (summary.pointsOfAgreement && summary.pointsOfAgreement.length > 0) {
    doc.fillColor(COLORS.primary)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("B. Points of Consensus", 72, y);

    y += 20;

    summary.pointsOfAgreement.forEach((point, i) => {
      doc.fillColor(COLORS.text)
        .fontSize(10)
        .font("Helvetica")
        .text(`${i + 1}. ${point}`, 90, y, { width: contentWidth - 30, lineGap: 2 });
      y = doc.y + 10;
    });

    y += 15;
  }

  // Check for page break
  if (y > doc.page.height - 200) {
    doc.addPage();
    y = 72;
  }

  // C. Points of Disagreement
  if (summary.pointsOfDisagreement && summary.pointsOfDisagreement.length > 0) {
    doc.fillColor(COLORS.primary)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("C. Points of Contention", 72, y);

    y += 20;

    summary.pointsOfDisagreement.forEach((point, i) => {
      doc.fillColor(COLORS.text)
        .fontSize(10)
        .font("Helvetica")
        .text(`${i + 1}. ${point}`, 90, y, { width: contentWidth - 30, lineGap: 2 });
      y = doc.y + 10;
    });

    y += 15;
  }

  // D. Actionable Insights
  if (summary.actionableInsights && summary.actionableInsights.length > 0) {
    if (y > doc.page.height - 150) {
      doc.addPage();
      y = 72;
    }

    doc.fillColor(COLORS.primary)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("D. Actionable Recommendations", 72, y);

    y += 20;

    summary.actionableInsights.forEach((insight, i) => {
      doc.fillColor(COLORS.text)
        .fontSize(10)
        .font("Helvetica")
        .text(`${i + 1}. ${insight}`, 90, y, { width: contentWidth - 30, lineGap: 2 });
      y = doc.y + 10;
    });
  }
}

function renderTranscript(
  doc: PDFKit.PDFDocument,
  summary: ComprehensiveDebateSummary,
  participants: ParticipantInfo[]
) {
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 144;

  renderSectionHeader(doc, "IV. VERBATIM TRANSCRIPT OF PROCEEDINGS", 72);

  let y = 140;

  doc.fillColor(COLORS.muted)
    .fontSize(9)
    .font("Helvetica-Oblique")
    .text(
      "The following is a complete transcript of all statements made during the proceeding, organized by phase.",
      72, y, { width: contentWidth }
    );

  y = doc.y + 25;

  if (!summary.transcript || summary.transcript.length === 0) {
    doc.fillColor(COLORS.muted)
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text("No transcript available.", 72, y);
    return;
  }

  let turnCounter = 0;

  for (const phaseSection of summary.transcript) {
    // Phase header
    if (y > doc.page.height - 120) {
      doc.addPage();
      y = 72;
    }

    doc.rect(72, y, contentWidth, 25).fill(COLORS.primary);
    doc.fillColor(COLORS.white)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`PHASE: ${(phaseSection.phase || "UNKNOWN").toUpperCase()}`, 82, y + 7);

    y += 35;

    // Turns in this phase
    for (const turn of phaseSection.turns || []) {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 72;
      }

      turnCounter++;
      const participant = participants.find(p => p.id === turn.avatarId);
      const color = participant?.color || COLORS.text;

      // Turn indicator
      doc.fillColor(COLORS.muted)
        .fontSize(8)
        .font("Helvetica")
        .text(`[Turn ${turnCounter}]`, 72, y);

      // Speaker line
      doc.fillColor(color)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`${turn.avatarName || "Unknown"}:`, 72, y + 12);

      // Timestamp if available
      if (turn.timestamp) {
        doc.fillColor(COLORS.muted)
          .fontSize(8)
          .font("Helvetica")
          .text(formatTimestamp(turn.timestamp), pageWidth - 130, y + 12);
      }

      y += 28;

      // Content with left border
      const contentStartY = y;
      doc.fillColor(COLORS.text)
        .fontSize(10)
        .font("Helvetica")
        .text(turn.content, 90, y, {
          width: contentWidth - 30,
          align: "justify",
          lineGap: 2,
        });

      // Left accent border
      const contentEndY = doc.y;
      doc.rect(76, contentStartY - 3, 3, contentEndY - contentStartY + 6).fill(color);

      y = doc.y + 20;
    }

    y += 10;
  }
}

function renderPositionAnalysis(
  doc: PDFKit.PDFDocument,
  summary: ComprehensiveDebateSummary,
  participants: ParticipantInfo[]
) {
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 144;

  renderSectionHeader(doc, "V. POSITION ANALYSIS", 72);

  let y = 140;

  // Analyze each participant's position
  const positions = [
    { participant: participants[0], position: summary.avatar1Position },
    { participant: participants[1], position: summary.avatar2Position },
  ];

  for (const { participant, position } of positions) {
    if (!participant || !position) continue;

    if (y > doc.page.height - 200) {
      doc.addPage();
      y = 72;
    }

    // Participant header
    doc.rect(72, y, contentWidth, 30).fill(participant.color);
    doc.fillColor(COLORS.white)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Analysis: ${participant.name}`, 82, y + 9);

    y += 40;

    // Core Argument
    if (position.coreArgument) {
      doc.fillColor(COLORS.primary)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Core Position:", 72, y);

      y += 15;

      doc.rect(85, y, contentWidth - 26, 3).fill(participant.color);
      y += 8;

      doc.fillColor(COLORS.text)
        .fontSize(10)
        .font("Helvetica-Oblique")
        .text(`"${position.coreArgument}"`, 90, y, { width: contentWidth - 36, lineGap: 2 });

      y = doc.y + 15;
    }

    // Key Points
    if (position.keyPoints && position.keyPoints.length > 0) {
      doc.fillColor(COLORS.primary)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Key Arguments:", 72, y);

      y += 15;

      position.keyPoints.forEach((point, i) => {
        doc.fillColor(COLORS.text)
          .fontSize(9)
          .font("Helvetica")
          .text(`${romanNumeral(i + 1)}. ${point}`, 90, y, { width: contentWidth - 36 });
        y = doc.y + 8;
      });

      y += 10;
    }

    // Strengths
    if (position.strengths && position.strengths.length > 0) {
      doc.fillColor("#047857")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Strengths Demonstrated:", 72, y);

      y += 15;

      position.strengths.forEach((strength) => {
        doc.fillColor(COLORS.text)
          .fontSize(9)
          .font("Helvetica")
          .text(`• ${strength}`, 90, y, { width: contentWidth - 36 });
        y = doc.y + 6;
      });

      y += 10;
    }

    // Weaknesses
    if (position.weaknesses && position.weaknesses.length > 0) {
      doc.fillColor("#b91c1c")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Areas of Challenge:", 72, y);

      y += 15;

      position.weaknesses.forEach((weakness) => {
        doc.fillColor(COLORS.text)
          .fontSize(9)
          .font("Helvetica")
          .text(`• ${weakness}`, 90, y, { width: contentWidth - 36 });
        y = doc.y + 6;
      });

      y += 10;
    }

    y += 20;
  }
}

function renderFindings(
  doc: PDFKit.PDFDocument,
  summary: ComprehensiveDebateSummary,
  participants: ParticipantInfo[]
) {
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 144;

  renderSectionHeader(doc, "VI. FINDINGS AND CONCLUSIONS", 72);

  let y = 140;

  // A. Summary of Arguments
  doc.fillColor(COLORS.primary)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("A. Summary of Principal Arguments", 72, y);

  y += 20;

  doc.fillColor(COLORS.text)
    .fontSize(10)
    .font("Helvetica")
    .text(
      `This proceeding examined the matter of "${summary.topic}" through the perspectives of ${participants.length} expert advisors. Each participant brought distinct expertise and analytical frameworks to the discussion.`,
      72, y, { width: contentWidth, align: "justify", lineGap: 3 }
    );

  y = doc.y + 25;

  // B. Unresolved Questions
  if (summary.unresolvedQuestions && summary.unresolvedQuestions.length > 0) {
    doc.fillColor(COLORS.primary)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("B. Matters Requiring Further Consideration", 72, y);

    y += 20;

    summary.unresolvedQuestions.forEach((question, i) => {
      doc.fillColor(COLORS.text)
        .fontSize(10)
        .font("Helvetica")
        .text(`${i + 1}. ${question}`, 90, y, { width: contentWidth - 30, lineGap: 2 });
      y = doc.y + 10;
    });

    y += 15;
  }

  // C. Assessment
  if (y > doc.page.height - 200) {
    doc.addPage();
    y = 72;
  }

  doc.fillColor(COLORS.primary)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("C. Panel Assessment", 72, y);

  y += 20;

  // Calculate participation metrics
  const totalTurns = participants.reduce((sum, p) => sum + p.turns, 0);

  doc.fillColor(COLORS.text)
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Based on the testimony and arguments presented, the panel comprised ${participants.length} expert advisors who collectively contributed ${totalTurns} turns of substantive discussion. `,
      72, y, { width: contentWidth, align: "justify", lineGap: 3, continued: true }
    )
    .text(
      "The diversity of perspectives offered provides a comprehensive examination of the subject matter from multiple professional standpoints.",
      { continued: false }
    );

  y = doc.y + 20;

  // Participation breakdown
  doc.fillColor(COLORS.muted)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("Participation Breakdown:", 90, y);

  y += 15;

  participants.forEach(p => {
    const percentage = totalTurns > 0 ? Math.round((p.turns / totalTurns) * 100) : 0;
    doc.fillColor(p.color)
      .fontSize(9)
      .font("Helvetica")
      .text(`${p.name}: ${p.turns} turns (${percentage}%)`, 100, y);
    y += 14;
  });
}

function renderCertification(
  doc: PDFKit.PDFDocument,
  summary: ComprehensiveDebateSummary,
  documentNumber: string
) {
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 144;

  renderSectionHeader(doc, "VII. CERTIFICATION", 72);

  let y = 140;

  doc.fillColor(COLORS.text)
    .fontSize(10)
    .font("Helvetica")
    .text(
      "I hereby certify that the foregoing is a true and accurate transcript of the proceedings conducted before the Avatar Council Expert Advisory Panel, and that the analysis and findings contained herein represent a faithful summary of the arguments and positions presented.",
      72, y, { width: contentWidth, align: "justify", lineGap: 3 }
    );

  y = doc.y + 40;

  // Signature block
  doc.moveTo(72, y).lineTo(280, y).stroke(COLORS.border);

  y += 10;

  doc.fillColor(COLORS.text)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Avatar Council Document System", 72, y);

  y += 15;

  doc.fillColor(COLORS.muted)
    .fontSize(9)
    .font("Helvetica")
    .text(`Document Number: ${documentNumber}`, 72, y);

  y += 12;

  doc.text(`Generated: ${formatDateFormal(summary.generatedAt || new Date().toISOString())}`, 72, y);

  y += 40;

  // Official seal placeholder
  doc.rect(pageWidth - 172, y - 60, 100, 100).stroke(COLORS.border);
  doc.fillColor(COLORS.muted)
    .fontSize(8)
    .font("Helvetica")
    .text("[OFFICIAL SEAL]", pageWidth - 172, y - 10, { width: 100, align: "center" });

  // Disclaimer
  y += 80;

  doc.rect(72, y, contentWidth, 70).fillAndStroke("#fef3c7", "#d69e2e");

  doc.fillColor("#92400e")
    .fontSize(8)
    .font("Helvetica-Bold")
    .text("IMPORTANT NOTICE", 82, y + 10);

  doc.fillColor("#78350f")
    .fontSize(8)
    .font("Helvetica")
    .text(
      "This document contains AI-generated content representing expert persona simulations. The positions expressed are algorithmic interpretations based on defined expertise profiles. This transcript is provided for informational and educational purposes. Users should exercise independent judgment when considering the arguments presented herein.",
      82, y + 25, { width: contentWidth - 20, lineGap: 2 }
    );
}

function renderAppendix(
  doc: PDFKit.PDFDocument,
  summary: ComprehensiveDebateSummary,
  participants: ParticipantInfo[]
) {
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - 144;

  renderSectionHeader(doc, "APPENDIX: TECHNICAL METRICS", 72);

  let y = 140;

  // Session metrics table
  doc.fillColor(COLORS.primary)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("A. Session Statistics", 72, y);

  y += 20;

  const metrics = [
    ["Debate ID:", summary.debateId || "N/A"],
    ["Total Duration:", formatDuration(summary.totalDuration || 0)],
    ["Total Turns:", String(summary.totalTurns || 0)],
    ["Participant Count:", String(participants.length)],
    ["Generated:", summary.generatedAt || "N/A"],
  ];

  // Table header
  doc.rect(72, y, contentWidth, 20).fill("#f1f5f9");
  doc.fillColor(COLORS.text)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("Metric", 82, y + 5)
    .text("Value", 280, y + 5);

  y += 20;

  metrics.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.rect(72, y, contentWidth, 18).fill("#fafafa");
    }
    doc.fillColor(COLORS.text)
      .fontSize(9)
      .font("Helvetica")
      .text(label, 82, y + 4)
      .text(value, 280, y + 4);
    y += 18;
  });

  y += 25;

  // Participant metrics
  doc.fillColor(COLORS.primary)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("B. Participant Contributions", 72, y);

  y += 20;

  // Table header
  doc.rect(72, y, contentWidth, 20).fill("#f1f5f9");
  doc.fillColor(COLORS.text)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("Participant", 82, y + 5)
    .text("Turns", 280, y + 5)
    .text("Tokens", 340, y + 5)
    .text("Share", 420, y + 5);

  y += 20;

  const totalTurns = participants.reduce((sum, p) => sum + p.turns, 0);

  participants.forEach((p, i) => {
    if (i % 2 === 0) {
      doc.rect(72, y, contentWidth, 18).fill("#fafafa");
    }
    const share = totalTurns > 0 ? Math.round((p.turns / totalTurns) * 100) : 0;

    doc.fillColor(p.color)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(p.name, 82, y + 4);

    doc.fillColor(COLORS.text)
      .font("Helvetica")
      .text(String(p.turns), 280, y + 4)
      .text(p.tokens.toLocaleString(), 340, y + 4)
      .text(`${share}%`, 420, y + 4);

    y += 18;
  });
}

// =============================================================================
// Utility Functions
// =============================================================================

function renderSectionHeader(doc: PDFKit.PDFDocument, title: string, y: number, withLine = true) {
  const pageWidth = doc.page.width;

  doc.fillColor(COLORS.primary)
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(title, 72, y);

  if (withLine) {
    doc.moveTo(72, y + 22).lineTo(pageWidth - 72, y + 22).lineWidth(1).stroke(COLORS.primary);
  }
}

function addPageNumbersAndHeaders(doc: PDFKit.PDFDocument, documentNumber: string) {
  const pages = doc.bufferedPageRange();
  const pageWidth = doc.page.width;

  for (let i = 1; i < pages.count; i++) {
    doc.switchToPage(i);

    // Header (skip title page)
    doc.fillColor(COLORS.muted)
      .fontSize(8)
      .font("Helvetica")
      .text(`Document No. ${documentNumber}`, 72, 40)
      .text("Avatar Council Official Transcript", pageWidth - 200, 40, { width: 128, align: "right" });

    // Footer with page number
    doc.fillColor(COLORS.muted)
      .fontSize(9)
      .font("Helvetica")
      .text(
        `Page ${i + 1} of ${pages.count}`,
        72, doc.page.height - 40,
        { align: "center", width: pageWidth - 144 }
      );
  }
}

export default { generateDebateManuscript };
