import { pdfjs } from "react-pdf";

import {
  detectFontFamily,
  detectFontStyle
} from "./fontResolver";

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function getItemWidth({
  item,
  text,
  fontHeight,
  scale
}) {
  const pdfWidth = Number(item.width || 0) * scale;
  const estimatedWidth = text.length * fontHeight * 0.42;

  return Math.max(
    pdfWidth,
    estimatedWidth,
    8
  );
}

export async function extractPdfTextItems({
  fileUrl,
  pageNumber,
  renderWidth = 820
}) {
  if (!fileUrl || !pageNumber) {
    return [];
  }

  const loadingTask = pdfjs.getDocument(fileUrl);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);

  const baseViewport = page.getViewport({
    scale: 1
  });

  const scale = renderWidth / baseViewport.width;

  const viewport = page.getViewport({
    scale
  });

  const textContent = await page.getTextContent();
  const styles = textContent.styles || {};

  const rawItems = textContent.items
    .map((item, index) => {
      const text = normalizeWhitespace(item.str);

      if (!text) return null;

      const transform = pdfjs.Util.transform(
        viewport.transform,
        item.transform
      );

      const x = transform[4];

      const transformFontSize =
        Math.hypot(transform[2], transform[3]) ||
        Math.abs(transform[3]) ||
        Math.abs(Number(item.height || 0) * scale) ||
        12;

      const fontSize = Math.max(
        6,
        Math.round(transformFontSize)
      );

      const height = Math.max(
        fontSize * 1.2,
        8
      );

      const y = transform[5] - height;

      const styleInfo = styles[item.fontName] || {};

      const detectedStyle = detectFontStyle(
        item.fontName,
        styleInfo.fontFamily
      );

      const detectedFontFamily = detectFontFamily(
        item.fontName,
        styleInfo.fontFamily
      );

      const width = getItemWidth({
        item,
        text,
        fontHeight: fontSize,
        scale
      });

      return {
        id: `${pageNumber}-${index}`,
        pageNumber,
        text,
        x,
        y,
        width,
        height,
        endX: x + width,
        centerY: y + height / 2,
        fontSize,
        fontName: item.fontName,
        originalFontFamily: styleInfo.fontFamily || "",
        fontFamily: detectedFontFamily,
        color: "#111827",
        ...detectedStyle
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (Math.abs(a.y - b.y) > 5) {
        return a.y - b.y;
      }

      return a.x - b.x;
    });

  const lines = [];

  for (const item of rawItems) {
    let line = lines.find((existingLine) => {
      return (
        Math.abs(existingLine.centerY - item.centerY) <
        Math.max(existingLine.height, item.height) * 0.55
      );
    });

    if (!line) {
      lines.push({
        id: `line-${pageNumber}-${lines.length}`,
        type: "detectedText",
        pageNumber,
        text: item.text,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        endX: item.endX,
        centerY: item.centerY,
        fontSize: item.fontSize,
        fontName: item.fontName,
        originalFontFamily: item.originalFontFamily,
        fontFamily: item.fontFamily,
        fontWeight: item.fontWeight,
        fontStyle: item.fontStyle,
        color: item.color,
        items: [item]
      });

      continue;
    }

    line.items.push(item);
    line.items.sort((a, b) => a.x - b.x);

    const first = line.items[0];

    line.text = line.items
      .map((part) => part.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    line.x = Math.min(line.x, item.x);
    line.y = Math.min(line.y, item.y);
    line.endX = Math.max(line.endX, item.endX);
    line.width = line.endX - line.x;
    line.height = Math.max(line.height, item.height);
    line.centerY = line.y + line.height / 2;

    line.fontSize = Math.max(
      ...line.items.map((part) => part.fontSize || 12)
    );

    line.fontWeight =
      line.items.some((part) => part.fontWeight === "bold")
        ? "bold"
        : first.fontWeight;

    line.fontStyle =
      line.items.some((part) => part.fontStyle === "italic")
        ? "italic"
        : first.fontStyle;

    line.fontFamily = first.fontFamily;
    line.originalFontFamily = first.originalFontFamily;
    line.fontName = first.fontName;
    line.color = first.color;
  }

  return lines.map((line) => ({
    ...line,
    width: Math.max(line.width + 8, 40),
    height: Math.max(
      line.height + 5,
      line.fontSize + 7
    )
  }));
}