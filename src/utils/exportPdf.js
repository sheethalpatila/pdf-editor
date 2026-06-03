import {
  PDFDocument,
  StandardFonts,
  rgb
} from "pdf-lib";

import fontkit from "@pdf-lib/fontkit";
import { saveAs } from "file-saver";

import { getExportFontKey } from "./fontResolver";

const CUSTOM_FONT_URLS = {
  "serif-regular": "/fonts/NotoSerif-Regular.ttf",
  "serif-bold": "/fonts/NotoSerif-Bold.ttf",
  "serif-italic": "/fonts/NotoSerif-Italic.ttf",
  "serif-bold-italic": "/fonts/NotoSerif-BoldItalic.ttf",

  "sans-regular": "/fonts/NotoSans-Regular.ttf",
  "sans-bold": "/fonts/NotoSans-Bold.ttf",
  "sans-italic": "/fonts/NotoSans-Italic.ttf",
  "sans-bold-italic": "/fonts/NotoSans-BoldItalic.ttf"
};

function hexToRgb(hex = "#111827") {
  const cleanHex = hex.replace("#", "");

  const r =
    parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g =
    parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b =
    parseInt(cleanHex.substring(4, 6), 16) / 255;

  return rgb(r, g, b);
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(",")[1];

  if (!base64) {
    throw new Error("Invalid image data URL");
  }

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Failed to load image"));

    image.src = dataUrl;
  });
}

async function convertImageToPngBytes(dataUrl) {
  const image = await loadImage(dataUrl);

  const canvas = document.createElement("canvas");

  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);

  const pngDataUrl = canvas.toDataURL("image/png");

  return dataUrlToUint8Array(pngDataUrl);
}

function getFallbackViewport(page) {
  const pdfWidth = page.getWidth();
  const pdfHeight = page.getHeight();

  const previewWidth = 820;
  const previewHeight =
    (pdfHeight / pdfWidth) * previewWidth;

  return {
    width: previewWidth,
    height: previewHeight
  };
}

async function tryEmbedCustomFont({
  pdfDoc,
  fontUrl
}) {
  try {
    if (!fontUrl) return null;

    const response = await fetch(fontUrl);

    if (!response.ok) return null;

    const fontBytes = await response.arrayBuffer();

    return await pdfDoc.embedFont(fontBytes);
  } catch {
    return null;
  }
}

async function buildFonts(pdfDoc) {
  pdfDoc.registerFontkit(fontkit);

  const standardFonts = {
    helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
    helveticaBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    helveticaItalic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    helveticaBoldItalic: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),

    times: await pdfDoc.embedFont(StandardFonts.TimesRoman),
    timesBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
    timesItalic: await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
    timesBoldItalic: await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic),

    courier: await pdfDoc.embedFont(StandardFonts.Courier),
    courierBold: await pdfDoc.embedFont(StandardFonts.CourierBold),
    courierItalic: await pdfDoc.embedFont(StandardFonts.CourierOblique),
    courierBoldItalic: await pdfDoc.embedFont(StandardFonts.CourierBoldOblique)
  };

  const customFonts = {};

  for (const [key, url] of Object.entries(CUSTOM_FONT_URLS)) {
    const embedded = await tryEmbedCustomFont({
      pdfDoc,
      fontUrl: url
    });

    if (embedded) {
      customFonts[key] = embedded;
    }
  }

  return {
    standardFonts,
    customFonts
  };
}

function chooseFont({
  edit,
  standardFonts,
  customFonts
}) {
  const key = getExportFontKey(edit);

  if (customFonts[key]) {
    return customFonts[key];
  }

  const isBold = edit.fontWeight === "bold";
  const isItalic = edit.fontStyle === "italic";

  const family = String(edit.fontFamily || "").toLowerCase();

  const isTimes =
    family.includes("times") ||
    family.includes("serif") ||
    family.includes("roman");

  const isCourier =
    family.includes("courier") ||
    family.includes("mono");

  if (isTimes) {
    if (isBold && isItalic) return standardFonts.timesBoldItalic;
    if (isBold) return standardFonts.timesBold;
    if (isItalic) return standardFonts.timesItalic;
    return standardFonts.times;
  }

  if (isCourier) {
    if (isBold && isItalic) return standardFonts.courierBoldItalic;
    if (isBold) return standardFonts.courierBold;
    if (isItalic) return standardFonts.courierItalic;
    return standardFonts.courier;
  }

  if (isBold && isItalic) return standardFonts.helveticaBoldItalic;
  if (isBold) return standardFonts.helveticaBold;
  if (isItalic) return standardFonts.helveticaItalic;

  return standardFonts.helvetica;
}

function wrapTextByWidth({
  text,
  font,
  fontSize,
  maxWidth
}) {
  const paragraphs = String(text || "").split("\n");
  const lines = [];

  for (const paragraph of paragraphs) {
    const words = paragraph
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine
        ? `${currentLine} ${word}`
        : word;

      const width = font.widthOfTextAtSize(
        testLine,
        fontSize
      );

      if (width <= maxWidth || !currentLine) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

export async function createEditedPdfBlob({
  fileRecord,
  edits = [],
  pageViewports = {}
}) {
  try {
    if (!fileRecord?.blob) {
      alert("No PDF file found");
      return;
    }

    const arrayBuffer =
      await fileRecord.blob.arrayBuffer();

    const pdfDoc = await PDFDocument.load(
      arrayBuffer
    );

    const {
      standardFonts,
      customFonts
    } = await buildFonts(pdfDoc);

    const pages = pdfDoc.getPages();

    const sortedEdits = [
      ...edits.filter((edit) => edit.type === "cover"),
      ...edits.filter((edit) => edit.type === "highlight"),
      ...edits.filter((edit) => edit.type === "image"),
      ...edits.filter((edit) => edit.type === "sign"),
      ...edits.filter((edit) => edit.type === "text")
    ];

    for (const edit of sortedEdits) {
      const page = pages[edit.pageNumber - 1];

      if (!page) continue;

      const pdfWidth = page.getWidth();
      const pdfHeight = page.getHeight();

      const viewport =
        pageViewports?.[edit.pageNumber] ||
        getFallbackViewport(page);

      const scaleX = pdfWidth / viewport.width;
      const scaleY = pdfHeight / viewport.height;

      const x = Number(edit.x || 0) * scaleX;
      const y =
        pdfHeight - Number(edit.y || 0) * scaleY;

      if (edit.type === "cover") {
        page.drawRectangle({
          x,
          y:
            y -
            Number(edit.height || 0) * scaleY,
          width:
            Number(edit.width || 0) * scaleX,
          height:
            Number(edit.height || 0) * scaleY,
          color: hexToRgb(edit.color || "#ffffff")
        });
      }

      if (edit.type === "highlight") {
        page.drawRectangle({
          x,
          y:
            y -
            Number(edit.height || 0) * scaleY,
          width:
            Number(edit.width || 0) * scaleX,
          height:
            Number(edit.height || 0) * scaleY,
          color: hexToRgb(edit.color || "#facc15"),
          opacity: Number(edit.opacity ?? 0.35)
        });
      }

      if (edit.type === "image" || edit.type === "sign") {
        if (!edit.src) continue;

        try {
          const imageBytes =
            await convertImageToPngBytes(edit.src);

          const embeddedImage =
            await pdfDoc.embedPng(imageBytes);

          page.drawImage(embeddedImage, {
            x,
            y:
              y -
              Number(edit.height || 0) * scaleY,
            width:
              Number(edit.width || 0) * scaleX,
            height:
              Number(edit.height || 0) * scaleY
          });
        } catch (error) {
          console.error(
            "Failed to embed image:",
            error
          );
        }
      }

      if (edit.type === "text") {
        const font = chooseFont({
          edit,
          standardFonts,
          customFonts
        });

        const fontSize =
          Number(edit.fontSize || 18) * scaleX;

        const maxWidth =
          Number(edit.width || 180) * scaleX;

        const lineHeight = fontSize * 1.15;

        const lines = wrapTextByWidth({
          text: edit.text || "",
          font,
          fontSize,
          maxWidth
        });

        lines.forEach((line, index) => {
          page.drawText(line, {
            x,
            y:
              y -
              fontSize -
              index * lineHeight,
            size: fontSize,
            font,
            color: hexToRgb(
              edit.color || "#111827"
            )
          });
        });
      }
    }

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], {
      type: "application/pdf"
    });

    const cleanName =
      fileRecord.name
        ?.replace(/\.pdf$/i, "") ||
      "edited";

    return {
      blob,
      fileName: `${cleanName}-edited.pdf`
    };
  } catch (error) {
    console.error("Export PDF failed:", error);
    alert(
      "Export failed. Please check console for details."
    );
  }
}

export async function exportEditedPdf({
  fileRecord,
  edits = [],
  pageViewports = {}
}) {
  const {
    blob,
    fileName
  } = await createEditedPdfBlob({
    fileRecord,
    edits,
    pageViewports
  });

  saveAs(blob, fileName);
}

export async function printEditedPdf({
  fileRecord,
  edits = [],
  pageViewports = {}
}) {
  const { blob } = await createEditedPdfBlob({
    fileRecord,
    edits,
    pageViewports
  });

  const blobUrl = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = blobUrl;

  document.body.appendChild(iframe);

  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(iframe);
    }, 1000);
  };
}