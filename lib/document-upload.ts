import { MAX_DOCUMENT_BYTES } from "@/lib/document-types";\n\n/**
 * Safe document intake allowlist.
 * Executables, scripts, HTML/SVG and archives are intentionally excluded.
 */
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

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

export const DOCUMENT_ACCEPT = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".odt", ".ods", ".odp", ".rtf", ".txt", ".csv",
  ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif",
].join(",");

export function getDocumentMime(fileName: string, declaredType: string): string | null {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const expected = EXTENSION_MIME[extension];
  if (!expected) return null;
  if (declaredType && declaredType !== expected && declaredType !== "application/octet-stream") {
    // Browser MIME aliases are tolerated only for the same well-known extensions.
    const aliases: Record<string, string[]> = {
      doc: ["application/msword", "application/octet-stream"],
      docx: [expected, "application/zip", "application/octet-stream"],
      xls: [expected, "application/octet-stream"],
      xlsx: [expected, "application/zip", "application/octet-stream"],
      ppt: [expected, "application/octet-stream"],
      pptx: [expected, "application/zip", "application/octet-stream"],
      odt: [expected, "application/zip", "application/octet-stream"],
      ods: [expected, "application/zip", "application/octet-stream"],
      odp: [expected, "application/zip", "application/octet-stream"],
      txt: ["text/plain", "application/octet-stream"],
      csv: ["text/csv", "text/plain", "application/vnd.ms-excel", "application/octet-stream"],
      heic: [expected, "image/heic-sequence", "application/octet-stream"],
      heif: [expected, "application/octet-stream"],
    };
    if (!(aliases[extension] ?? [expected]).includes(declaredType)) return null;
  }
  return expected;
}

export function hasValidDocumentSignature(bytes: Buffer, mime: string): boolean {
  if (mime === "application/pdf") return bytes.subarray(0, 5).toString() === "%PDF-";
  if (mime === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/webp") return bytes.subarray(0,4).toString() === "RIFF" && bytes.subarray(8,12).toString() === "WEBP";
  if (mime === "image/heic" || mime === "image/heif") {
    return bytes.subarray(4, 8).toString() === "ftyp" &&
      /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(bytes.subarray(8, 12).toString());
  }
  if (mime === "application/msword" || mime === "application/vnd.ms-excel" || mime === "application/vnd.ms-powerpoint") {
    return bytes.subarray(0,8).equals(Buffer.from([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1]));
  }
  if (mime.includes("openxmlformats") || mime.includes("opendocument")) {
    return bytes.subarray(0,2).toString() === "PK";
  }
  if (mime === "application/rtf") return bytes.subarray(0,5).toString() === "{\\rtf";
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
