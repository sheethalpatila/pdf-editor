export function detectFontStyle(fontName = "", fontFamily = "") {
  const source = `${fontName} ${fontFamily}`.toLowerCase();

  const isBold =
    source.includes("bold") ||
    source.includes("black") ||
    source.includes("heavy") ||
    source.includes("semibold");

  const isItalic =
    source.includes("italic") ||
    source.includes("oblique");

  return {
    fontWeight: isBold ? "bold" : "normal",
    fontStyle: isItalic ? "italic" : "normal"
  };
}

export function detectFontFamily(fontName = "", fontFamily = "") {
  const source = `${fontName} ${fontFamily}`.toLowerCase();

  if (
    source.includes("times") ||
    source.includes("roman") ||
    source.includes("serif") ||
    source.includes("cmr") ||
    source.includes("georgia")
  ) {
    return "Times New Roman";
  }

  if (
    source.includes("courier") ||
    source.includes("mono") ||
    source.includes("consola")
  ) {
    return "Courier New";
  }

  if (
    source.includes("calibri") ||
    source.includes("arial") ||
    source.includes("helvetica") ||
    source.includes("sans")
  ) {
    return "Arial";
  }

  return "Times New Roman";
}

export function getCssFontFamily(fontFamily) {
  const family = String(fontFamily || "").toLowerCase();

  if (
    family.includes("times") ||
    family.includes("serif") ||
    family.includes("roman")
  ) {
    return `"Times New Roman", Times, serif`;
  }

  if (
    family.includes("courier") ||
    family.includes("mono")
  ) {
    return `"Courier New", Courier, monospace`;
  }

  return `Arial, Helvetica, sans-serif`;
}

export function getExportFontKey(edit) {
  const family = String(edit.fontFamily || "").toLowerCase();

  const isBold = edit.fontWeight === "bold";
  const isItalic = edit.fontStyle === "italic";

  let base = "sans";

  if (
    family.includes("times") ||
    family.includes("serif") ||
    family.includes("roman")
  ) {
    base = "serif";
  }

  if (
    family.includes("courier") ||
    family.includes("mono")
  ) {
    base = "mono";
  }

  if (isBold && isItalic) return `${base}-bold-italic`;
  if (isBold) return `${base}-bold`;
  if (isItalic) return `${base}-italic`;

  return `${base}-regular`;
}