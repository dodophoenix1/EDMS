import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export interface WatermarkOptions {
  userName: string;
  userRole: string;
  ipAddress: string;
  timestamp?: string;
  customText?: string;
}

/**
 * DLP & Dynamic PDF Watermarker using pdf-lib
 * Stamps User Name, Role, Timestamp, and IP Address onto PDF pages before preview/download
 * to prevent data leakage and enforce strict audit traceability.
 */
export async function applyDynamicWatermark(
  pdfBytes: Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    const timestamp = options.timestamp || new Date().toLocaleString('th-TH');
    const watermarkText = options.customText || 
      `CONFIDENTIAL - SCHOOL EDMS | Viewer: ${options.userName} [${options.userRole.toUpperCase()}] | IP: ${options.ipAddress} | ${timestamp}`;

    for (const page of pages) {
      const { width, height } = page.getSize();
      const fontSize = Math.max(10, Math.min(14, width / 45));

      // Draw primary diagonal watermark across page center
      page.drawText(watermarkText, {
        x: width * 0.08,
        y: height * 0.45,
        size: fontSize,
        font: font,
        color: rgb(0.85, 0.15, 0.15), // Crimson Red
        opacity: 0.22,
        rotate: degrees(35),
      });

      // Draw secondary watermark line at bottom header for subtle protection
      page.drawText(`Secured Document ID: ${options.userName} (${options.ipAddress}) - ${timestamp}`, {
        x: 20,
        y: 15,
        size: 8,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
        opacity: 0.4,
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error('Failed to stamp watermark on PDF:', error);
    return pdfBytes; // Return original if not a valid PDF or error
  }
}

/**
 * Generates a sample PDF Uint8Array for testing preview & watermark when no external PDF is uploaded.
 */
export async function generateSamplePdf(title: string, content: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Document Header
  page.drawText('THAI GOVERNMENT DOCUMENT SYSTEM', {
    x: 50,
    y: 790,
    size: 16,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.5),
  });

  page.drawText(`Subject: ${title}`, {
    x: 50,
    y: 750,
    size: 14,
    font: boldFont,
  });

  // Body content lines
  const lines = content.split('\n');
  let currentY = 700;
  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y: currentY,
      size: 11,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentY -= 20;
  }

  return await pdfDoc.save();
}
