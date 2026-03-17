/**
 * Preview script — generates sample signed PDFs for all 3 documents.
 * Run: npx tsx scripts/preview-signed-pdf.ts
 * Opens the PDFs automatically on macOS.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import zlib from "zlib";
import { generateSignedPdf } from "../server/services/documentSigningService";

const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = path.dirname(__filename2);
const OUTPUT_DIR = path.join(__dirname2, "../tmp-preview");

const signerInfo = {
  name: "Marcus J. Williams",
  email: "marcus.williams@example.com",
  ipAddress: "73.162.44.201",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  signedAt: new Date(),
};

/**
 * Generate a PNG image of a signature using raw pixel manipulation.
 * No external dependencies needed — builds a valid PNG from scratch.
 */
function createSignaturePng(): string {
  const width = 400;
  const height = 120;

  // RGBA pixel buffer (each row has a filter byte prefix for PNG)
  const rawData = Buffer.alloc((width * 4 + 1) * height, 0);

  // Set all pixels to white with full alpha
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // PNG filter: None
    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      rawData[px] = 255;     // R
      rawData[px + 1] = 255; // G
      rawData[px + 2] = 255; // B
      rawData[px + 3] = 255; // A
    }
  }

  // Draw a dark pixel at (x, y) with anti-aliased thickness
  function drawDot(cx: number, cy: number, radius: number) {
    const r = Math.round(radius);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const px = Math.round(cx) + dx;
        const py = Math.round(cy) + dy;
        if (px < 0 || px >= width || py < 0 || py >= height) continue;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) continue;
        const alpha = Math.max(0, Math.min(255, Math.round(255 * (1 - dist / radius))));
        const rowOffset = py * (width * 4 + 1);
        const offset = rowOffset + 1 + px * 4;
        const blend = alpha / 255;
        rawData[offset] = Math.round(31 * blend + rawData[offset] * (1 - blend));       // R (#1f)
        rawData[offset + 1] = Math.round(41 * blend + rawData[offset + 1] * (1 - blend)); // G (#29)
        rawData[offset + 2] = Math.round(55 * blend + rawData[offset + 2] * (1 - blend)); // B (#37)
        rawData[offset + 3] = 255;
      }
    }
  }

  // Draw a line between two points
  function drawLine(x0: number, y0: number, x1: number, y1: number, thickness: number) {
    const dist = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
    const steps = Math.max(Math.ceil(dist * 2), 1);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      drawDot(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, thickness);
    }
  }

  // Draw a cubic bezier curve
  function drawBezier(x0: number, y0: number, cx1: number, cy1: number, cx2: number, cy2: number, x1: number, y1: number, thickness: number) {
    const steps = 60;
    let prevX = x0, prevY = y0;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const x = mt * mt * mt * x0 + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * x1;
      const y = mt * mt * mt * y0 + 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t * y1;
      drawLine(prevX, prevY, x, y, thickness);
      prevX = x;
      prevY = y;
    }
  }

  // Draw a realistic-looking cursive signature: "M Williams"
  // Capital M
  drawBezier(20, 85, 22, 30, 28, 25, 35, 70, 2.5);
  drawBezier(35, 70, 38, 30, 45, 25, 50, 70, 2.5);
  drawBezier(50, 70, 53, 30, 58, 25, 65, 85, 2.5);

  // Connecting swoop to "a"
  drawBezier(65, 85, 75, 90, 80, 60, 85, 55, 2.0);
  drawBezier(85, 55, 88, 45, 95, 48, 92, 58, 2.0);
  drawBezier(92, 58, 89, 72, 95, 78, 100, 65, 2.0);

  // "r"
  drawBezier(100, 65, 103, 50, 108, 48, 112, 55, 1.8);

  // "c" connecting
  drawBezier(112, 55, 116, 62, 120, 58, 118, 50, 1.8);
  drawBezier(118, 50, 116, 44, 122, 42, 128, 50, 1.8);

  // gap then "W"
  drawBezier(145, 40, 148, 80, 155, 85, 158, 50, 2.5);
  drawBezier(158, 50, 161, 80, 168, 85, 172, 50, 2.5);
  drawBezier(172, 50, 175, 80, 182, 85, 188, 40, 2.5);

  // "illiams" as a connected flowing script
  // "i"
  drawBezier(192, 55, 194, 48, 196, 50, 198, 60, 1.8);
  drawDot(195, 42, 2.5); // dot

  // "ll"
  drawBezier(198, 60, 202, 35, 206, 30, 208, 60, 1.8);
  drawBezier(208, 60, 212, 35, 216, 30, 218, 60, 1.8);

  // "i"
  drawBezier(218, 60, 222, 50, 224, 48, 226, 60, 1.8);
  drawDot(223, 42, 2.5);

  // "a"
  drawBezier(226, 60, 230, 48, 236, 46, 234, 56, 1.8);
  drawBezier(234, 56, 232, 66, 238, 70, 242, 58, 1.8);

  // "m"
  drawBezier(242, 58, 246, 45, 250, 44, 252, 58, 1.8);
  drawBezier(252, 58, 256, 45, 260, 44, 262, 58, 1.8);

  // "s" with trailing flourish
  drawBezier(262, 58, 266, 50, 270, 48, 268, 56, 1.8);
  drawBezier(268, 56, 266, 64, 272, 68, 278, 58, 1.8);
  // Trailing flourish
  drawBezier(278, 58, 290, 48, 310, 55, 330, 70, 1.5);

  // Build PNG file
  const compressed = zlib.deflateSync(rawData);

  function crc32(buf: Buffer): number {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function chunk(type: string, data: Buffer): Buffer {
    const typeBuffer = Buffer.from(type, "ascii");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcInput = Buffer.concat([typeBuffer, data]);
    const crcVal = Buffer.alloc(4);
    crcVal.writeUInt32BE(crc32(crcInput));
    return Buffer.concat([len, typeBuffer, data, crcVal]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    pngSignature,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  return "data:image/png;base64," + png.toString("base64");
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const signatureImage = createSignaturePng();
  const docs = ["nda", "debt_rollup", "compliance"];

  console.log("Generating signed PDF previews...\n");

  for (const docType of docs) {
    const pdfBuffer = await generateSignedPdf(docType, signatureImage, signerInfo);
    const outPath = path.join(OUTPUT_DIR, `${docType}_signed_preview.pdf`);
    fs.writeFileSync(outPath, pdfBuffer);
    console.log(`  ✓ ${docType} → ${outPath} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`\nDone! Opening folder...`);

  try {
    execSync(`open "${OUTPUT_DIR}"`);
  } catch {}
}

main().catch(console.error);
