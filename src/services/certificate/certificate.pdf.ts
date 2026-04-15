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

  const bInset = 4;
  const bInset2 = 7;

  // ─── PAGE 1: FRONT (Logo only) ────────────────
  const front = doc.addPage([CARD_W, CARD_H]);

  front.drawRectangle({
    x: 0,
    y: 0,
    width: CARD_W,
    height: CARD_H,
    color: DARK,
  });

  // Double gold border
  front.drawRectangle({
    x: bInset,
    y: bInset,
    width: CARD_W - bInset * 2,
    height: CARD_H - bInset * 2,
    borderColor: GOLD,
    borderWidth: 0.5,
  });
  front.drawRectangle({
    x: bInset2,
    y: bInset2,
    width: CARD_W - bInset2 * 2,
    height: CARD_H - bInset2 * 2,
    borderColor: GOLD,
    borderWidth: 0.25,
  });

  // Logo centered
  const logoScale = 0.28;
  const logoW = logoImg.width * logoScale;
  const logoH = logoImg.height * logoScale;
  front.drawImage(logoImg, {
    x: (CARD_W - logoW) / 2,
    y: (CARD_H - logoH) / 2,
    width: logoW,
    height: logoH,
  });

  // ─── PAGE 2: BACK (Capgold-style) ─────────────
  const back = doc.addPage([CARD_W, CARD_H]);

  back.drawRectangle({
    x: 0,
    y: 0,
    width: CARD_W,
    height: CARD_H,
    color: DARK,
  });

  // Double gold border
  back.drawRectangle({
    x: bInset,
    y: bInset,
    width: CARD_W - bInset * 2,
    height: CARD_H - bInset * 2,
    borderColor: GOLD,
    borderWidth: 0.5,
  });
  back.drawRectangle({
    x: bInset2,
    y: bInset2,
    width: CARD_W - bInset2 * 2,
    height: CARD_H - bInset2 * 2,
    borderColor: GOLD,
    borderWidth: 0.25,
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

  // --- Capgold-style fields ---
  const leftX = 18;
  const rightX = CARD_W - 18;
  const labelSize = 6;
  const valueSize = 9;

  // Row 1: weight / metal labels
  let y = CARD_H - 60;
  back.drawText("weight", {
    x: leftX,
    y,
    size: labelSize,
    font: fontRegular,
    color: GRAY,
  });
  const metalLabel = "metal";
  const metalLabelW = fontRegular.widthOfTextAtSize(metalLabel, labelSize);
  back.drawText(metalLabel, {
    x: rightX - metalLabelW,
    y,
    size: labelSize,
    font: fontRegular,
    color: GRAY,
  });

  // Row 1: weight / metal values
  y -= 20;
  back.drawText(cert.weight, {
    x: leftX,
    y,
    size: valueSize,
    font: fontBold,
    color: WHITE,
  });
  const metalVal = cert.metalType;
  const metalValW = fontBold.widthOfTextAtSize(metalVal, valueSize);
  back.drawText(metalVal, {
    x: rightX - metalValW,
    y,
    size: valueSize,
    font: fontBold,
    color: WHITE,
  });

  // Row 2: fineness / serial no labels
  y -= 30;
  back.drawText("fineness", {
    x: leftX,
    y,
    size: labelSize,
    font: fontRegular,
    color: GRAY,
  });
  const noLabel = "No.";
  const noLabelW = fontRegular.widthOfTextAtSize(noLabel, labelSize);
  back.drawText(noLabel, {
    x: rightX - noLabelW,
    y,
    size: labelSize,
    font: fontRegular,
    color: GRAY,
  });

  // Row 2: fineness / serial no values
  y -= 20;
  back.drawText(cert.purity, {
    x: leftX,
    y,
    size: valueSize,
    font: fontBold,
    color: WHITE,
  });
  const serialVal = cert.serialNo;
  const serialValW = fontBold.widthOfTextAtSize(serialVal, valueSize);
  back.drawText(serialVal, {
    x: rightX - serialValW,
    y,
    size: valueSize,
    font: fontBold,
    color: WHITE,
  });

  // Certified assayer
  y -= 35;
  const caLabel = "certified assayer";
  const caLabelW = fontRegular.widthOfTextAtSize(caLabel, labelSize);
  back.drawText(caLabel, {
    x: (CARD_W - caLabelW) / 2,
    y,
    size: labelSize,
    font: fontRegular,
    color: GRAY,
  });

  // Signature line
  y -= 18;
  const sigW = 50;
  back.drawLine({
    start: { x: (CARD_W - sigW) / 2, y },
    end: { x: (CARD_W + sigW) / 2, y },
    thickness: 0.3,
    color: GOLD,
  });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
