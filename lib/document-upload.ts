/**
 * Server-side validation for the document intake allowlist.
 * Executables, scripts, HTML/SVG and archives are intentionally excluded.
 */
const EXTENSION_MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  rtf: "application/rtf",
  txt: "text/plain",
  csv: "text/csv",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

export function getDocumentMime(fileName: string, declaredType: string): string | null {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const expected = EXTENSION_MIME[extension];
  if (!expected) return null;
  if (!declaredType || declaredType === "application/octet-stream" || declaredType === expected) {
    return expected;
  }

  const aliases: Record<string, string[]> = {
    docx: ["application/zip"],
    xlsx: ["application/zip"],
    pptx: ["application/zip"],
    odt: ["application/zip"],
    ods: ["application/zip"],
    odp: ["application/zip"],
    txt: ["text/plain"],
    csv: ["text/plain", "application/vnd.ms-excel"],
    heic: ["image/heic-sequence"],
  };
  return (aliases[extension] ?? []).includes(declaredType) ? expected : null;
}

export function hasValidDocumentSignature(bytes: Buffer, mime: string): boolean {
  if (mime === "application/pdf") return bytes.subarray(0, 5).toString() === "%PDF-";
  if (mime === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (mime === "image/heic" || mime === "image/heif") {
    return bytes.subarray(4, 8).toString() === "ftyp" &&
      /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(bytes.subarray(8, 12).toString());
  }
  if (mime === "application/msword" || mime === "application/vnd.ms-excel" || mime === "application/vnd.ms-powerpoint") {
    return bytes.subarray(0, 8).equals(Buffer.from([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1]));
  }
  if (mime.includes("openxmlformats") || mime.includes("opendocument")) {
    return bytes.subarray(0, 2).toString() === "PK";
  }
  if (mime === "application/rtf") return bytes.subarray(0, 5).toString() === "{\\rtf";
  if (mime === "text/plain" || mime === "text/csv") {
    if (bytes.includes(0)) return false;
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
