import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

const CARD_W = 142;
const CARD_H = 244;

const GOLD = rgb(201 / 255, 168 / 255, 76 / 255);
const DARK = rgb(9 / 255, 9 / 255, 11 / 255);
const WHITE = rgb(1, 1, 1);
const GRAY = rgb(0.6, 0.6, 0.6);

interface CertificateData {
  serialNo: string;
  metalType: string;
  weight: string;
  purity: string;
  manufactureYear: number;
  batchNo: string;
}

export async function generateCertificatePDF(
  cert: CertificateData
): Promise<Buffer> {
  const doc = await PDFDocument.create();

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  // Embed logo
  const logoPath = path.join(__dirname, "../../assets/wagagai-logo.png");
  const logoBytes = fs.readFileSync(logoPath);
  const logoImg = await doc.embedPng(logoBytes);

  // Embed signature (white strokes for dark background)
  const sigPath = path.join(__dirname, "../../assets/wagagai-signature-new.png");
  const sigBytes = fs.readFileSync(sigPath);
  const sigImg = await doc.embedPng(sigBytes);

  const bInset = 4;
  const bInset2 = 7;

  // ─── PAGE 1: FRONT (Logo only) ────────────────
  const front = doc.addPage([CARD_W, CARD_H]);

  front.drawRectangle({ x: 0, y: 0, width: CARD_W, height: CARD_H, color: DARK });

  front.drawRectangle({
    x: bInset, y: bInset,
    width: CARD_W - bInset * 2, height: CARD_H - bInset * 2,
    borderColor: GOLD, borderWidth: 0.5,
  });
  front.drawRectangle({
    x: bInset2, y: bInset2,
    width: CARD_W - bInset2 * 2, height: CARD_H - bInset2 * 2,
    borderColor: GOLD, borderWidth: 0.25,
  });

  const logoScale = 0.28;
  const logoW = logoImg.width * logoScale;
  const logoH = logoImg.height * logoScale;
  front.drawImage(logoImg, {
    x: (CARD_W - logoW) / 2,
    y: (CARD_H - logoH) / 2,
    width: logoW,
    height: logoH,
  });

  // ─── PAGE 2: BACK ─────────────────────────────
  const back = doc.addPage([CARD_W, CARD_H]);

  back.drawRectangle({ x: 0, y: 0, width: CARD_W, height: CARD_H, color: DARK });

  back.drawRectangle({
    x: bInset, y: bInset,
    width: CARD_W - bInset * 2, height: CARD_H - bInset * 2,
    borderColor: GOLD, borderWidth: 0.5,
  });
  back.drawRectangle({
    x: bInset2, y: bInset2,
    width: CARD_W - bInset2 * 2, height: CARD_H - bInset2 * 2,
    borderColor: GOLD, borderWidth: 0.25,
  });

  // "WAGAGAI" at top
  const topName = "WAGAGAI";
  const topNameW = fontBold.widthOfTextAtSize(topName, 10);
  back.drawText(topName, {
    x: (CARD_W - topNameW) / 2,
    y: CARD_H - 28,
    size: 10,
    font: fontBold,
    color: GOLD,
  });

  const leftX = 18;
  const rightX = CARD_W - 18;
  const labelSize = 6;
  const valueSize = 9;

  // Row 1: weight / metal labels
  let y = CARD_H - 60;
  back.drawText("weight", { x: leftX, y, size: labelSize, font: fontRegular, color: GRAY });
  const metalLabel = "metal";
  back.drawText(metalLabel, {
    x: rightX - fontRegular.widthOfTextAtSize(metalLabel, labelSize),
    y, size: labelSize, font: fontRegular, color: GRAY,
  });

  // Row 1: weight / metal values
  y -= 20;
  back.drawText(cert.weight, { x: leftX, y, size: valueSize, font: fontBold, color: WHITE });
  const metalValW = fontBold.widthOfTextAtSize(cert.metalType, valueSize);
  back.drawText(cert.metalType, { x: rightX - metalValW, y, size: valueSize, font: fontBold, color: WHITE });

  // Row 2: fineness / serial no labels
  y -= 30;
  back.drawText("fineness", { x: leftX, y, size: labelSize, font: fontRegular, color: GRAY });
  const noLabel = "No.";
  back.drawText(noLabel, {
    x: rightX - fontRegular.widthOfTextAtSize(noLabel, labelSize),
    y, size: labelSize, font: fontRegular, color: GRAY,
  });

  // Row 2: fineness / serial no values
  y -= 20;
  back.drawText(cert.purity, { x: leftX, y, size: valueSize, font: fontBold, color: WHITE });
  const serialValW = fontBold.widthOfTextAtSize(cert.serialNo, valueSize);
  back.drawText(cert.serialNo, { x: rightX - serialValW, y, size: valueSize, font: fontBold, color: WHITE });

  // Certified assayer label
  y -= 35;
  const caLabel = "certified assayer";
  const caLabelW = fontRegular.widthOfTextAtSize(caLabel, labelSize);
  back.drawText(caLabel, {
    x: (CARD_W - caLabelW) / 2,
    y, size: labelSize, font: fontRegular, color: GRAY,
  });

  // Signature image (white strokes on dark background)
  y -= 22;
  const sigDrawW = 60;
  const sigDrawH = (sigImg.height / sigImg.width) * sigDrawW;
  back.drawImage(sigImg, {
    x: (CARD_W - sigDrawW) / 2,
    y: y - sigDrawH,
    width: sigDrawW,
    height: sigDrawH,
  });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
