import {
  PDFDocument,
  StandardFonts,
  rgb
} from "pdf-lib";

import { saveAs } from "file-saver";

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

export async function exportEditedPdf({
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

    const font = await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

    const pages = pdfDoc.getPages();

    const sortedEdits = [
      ...edits.filter(
        (edit) => edit.type === "cover"
      ),
      ...edits.filter(
        (edit) => edit.type === "highlight"
      ),
      ...edits.filter(
        (edit) => edit.type === "image"
      ),
      ...edits.filter(
        (edit) => edit.type === "sign"
      ),
      ...edits.filter(
        (edit) => edit.type === "text"
      )
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
          color: hexToRgb(
            edit.color || "#ffffff"
          )
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
          color: hexToRgb(
            edit.color || "#facc15"
          ),
          opacity: Number(edit.opacity ?? 0.35)
        });
      }

      if (edit.type === "image" || edit.type === "sign") {
  if (!edit.src) continue;

  try {
    const imageBytes = await convertImageToPngBytes(edit.src);

    const embeddedImage = await pdfDoc.embedPng(imageBytes);

    page.drawImage(embeddedImage, {
      x,
      y: y - Number(edit.height || 0) * scaleY,
      width: Number(edit.width || 0) * scaleX,
      height: Number(edit.height || 0) * scaleY
    });
  } catch (error) {
    console.error("Failed to embed image:", error);
  }
}

      if (edit.type === "text") {
        page.drawText(edit.text || "", {
          x,
          y:
            y -
            Number(edit.fontSize || 18) *
              scaleY,
          size:
            Number(edit.fontSize || 18) *
            scaleX,
          font,
          color: hexToRgb(
            edit.color || "#111827"
          )
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

    saveAs(
      blob,
      `${cleanName}-edited.pdf`
    );
  } catch (error) {
    console.error("Export PDF failed:", error);
    alert(
      "Export failed. Please check console for details."
    );
  }
}