import { createHash } from "node:crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const bucket = "deal-vault";
export type SignatureRecord = {
 id: string; owner_id: string; document_path: string; signature_path: string | null;
 signer_name: string; title: string; signed_at: string | null; original_name: string;
 signature_page?: number | null; signature_x?: number | null; signature_y?: number | null; signature_width?: number | null; signature_height?: number | null;
};
export function signedPdfPath(row: SignatureRecord) {
 return `signatures/${row.owner_id}/${row.id}-completed.pdf`;
}
const digest = (data: Uint8Array) => createHash("sha256").update(data).digest("hex");
function printable(value: string) {
 // Standard PDF Helvetica supports WinAnsi, not arbitrary Unicode.
 return value.normalize("NFKD").replace(/[^\x20-\x7e]/g, "?").slice(0, 160);
}
export async function createSignedPdf(original: Uint8Array, signature: Uint8Array, row: SignatureRecord, signedAt: string) {
 const pdf = await PDFDocument.load(original, { updateMetadata: false });
 const image = await pdf.embedPng(signature);
 const positioned = Number.isInteger(row.signature_page) && (row.signature_page ?? 0)>0;
 const page = positioned ? pdf.getPage((row.signature_page as number)-1) : pdf.addPage([595.28, 841.89]);
 if(positioned){
  const x=row.signature_x??0,y=row.signature_y??0,w=row.signature_width??150,h=row.signature_height??50;
  if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0||x<0||y<0||x+w>page.getWidth()||y+h>page.getHeight())throw Error("Invalid signature placement.");
  page.drawImage(image,{x,y,width:w,height:h});
  pdf.setSubject("Electronic signature embedded in PDF by SignDealDocs");
  return Buffer.from(await pdf.save());
 }
 const font = await pdf.embedFont(StandardFonts.Helvetica);
 const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
 const ink = rgb(0.11, 0.16, 0.28);
 const label = (text: string, y: number, size = 12) => page.drawText(printable(text), {x: 52, y, size, font, color: ink, maxWidth: 490});
 page.drawText("ELECTRONIC SIGNATURE RECORD", {x:52,y:765,size:20,font:bold,color:ink});
 label("This page is appended to the document reviewed by the signer.", 733, 10);
 label(`Document: ${row.title}`, 685);
 label(`Signer: ${row.signer_name}`, 657);
 label(`Signed at (UTC): ${signedAt}`, 629);
 page.drawRectangle({x:52,y:425,width:490,height:165,borderColor:rgb(0.75,0.8,0.87),borderWidth:1});
 page.drawText("SIGNATURE", {x:65,y:566,size:10,font:bold,color:ink});
 const fit = image.scale(Math.min(1, 440 / image.width, 115 / image.height));
 page.drawImage(image,{x:65,y:439,width:fit.width,height:fit.height});
 label(`Original PDF SHA-256: ${digest(original)}`, 381, 9);
 label(`Signature PNG SHA-256: ${digest(signature)}`, 363, 9);
 label("Electronic signature image and audit record; not a certificate-based digital signature.", 325, 9);
 pdf.setTitle(row.title.slice(0,160));
 pdf.setSubject("Electronic signature record appended by SignDealDocs");
 return Buffer.from(await pdf.save());
}
/**
 * Produces an immutable completed PDF at a deterministic private-storage path.
 * Legacy signed records are generated lazily. Parallel requests may race to
 * upload, but never overwrite a completed document.
 */
export async function ensureSignedPdf(row: SignatureRecord) {
 if (!row.signed_at || !row.signature_path) throw Error("Signature is not complete.");
 const storage = getSupabaseAdmin().storage.from(bucket);
 const path = signedPdfPath(row);
 const existing = await storage.download(path);
 if (!existing.error && existing.data) return {path, bytes: Buffer.from(await existing.data.arrayBuffer())};
 const [document, signature] = await Promise.all([storage.download(row.document_path),storage.download(row.signature_path)]);
 if (document.error || !document.data || signature.error || !signature.data) throw Error("Signed document source is unavailable.");
 const bytes = await createSignedPdf(new Uint8Array(await document.data.arrayBuffer()),new Uint8Array(await signature.data.arrayBuffer()),row,row.signed_at);
 const uploaded = await storage.upload(path,bytes,{contentType:"application/pdf",upsert:false});
 if (uploaded.error) {
  // A concurrent request may have successfully created the same object.
  const retry = await storage.download(path);
  if (retry.error || !retry.data) throw Error("Could not store completed PDF.");
  return {path, bytes:Buffer.from(await retry.data.arrayBuffer())};
 }
 return {path,bytes};
}
export function pdfResponse(bytes: Buffer, filename: string) {
 const safe = filename.replace(/\.pdf$/i,"").replace(/[^a-zA-Z0-9._ -]/g,"_").slice(0,120) || "document";
 return new Response(new Uint8Array(bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${safe}-signed.pdf"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});
}
