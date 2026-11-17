import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getDocumentMime, hasValidDocumentSignature, MAX_DOCUMENT_BYTES } from "@/lib/document-upload";

export const runtime = "nodejs";

const BUCKET = "deal-vault";

type DealRow = {
  id: string; slug: string; client_name: string; client_email: string;
  project_title: string; currency: string; amount: number; status: string;
  signature_url: string | null; signed_at: string | null; created_at: string;
  proposal: string | null; required_documents: string[];
};

function hasValidFileSignature(bytes: Buffer, mime: string) {
  if (mime === "application/pdf") return bytes.subarray(0, 5).toString() === "%PDF-";
  if (mime === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  return false;
}

async function getDeal(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  const { data } = await getSupabaseAdmin().from("deals").select("*").eq("slug", token).maybeSingle();
  return (data as DealRow | null) ?? null;
}

async function signedUrl(path: string | null) {
  if (!path) return null;
  const { data } = await getSupabaseAdmin().storage.from(BUCKET).createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const deal = await getDeal(token);
  if (!deal) return NextResponse.json({ error: "Deal link is invalid or expired." }, { status: 404 });

  const { data: rows, error } = await getSupabaseAdmin()
    .from("deal_documents")
    .select("id, deal_id, document_label, file_name, file_url, created_at")
    .eq("deal_id", deal.id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Could not load deal documents." }, { status: 500 });

  const docs = await Promise.all((rows ?? []).map(async (row) => ({
    ...row,
    file_url: await signedUrl(row.file_url),
  })));
  return NextResponse.json({
    deal: {
      id: deal.id, slug: deal.slug, client_name: deal.client_name, client_email: deal.client_email,
      project_title: deal.project_title, currency: deal.currency, amount: deal.amount,
      status: deal.status, signature_url: await signedUrl(deal.signature_url),
      signed_at: deal.signed_at, created_at: deal.created_at, proposal: deal.proposal,
      required_documents: deal.required_documents,
    },
    files: docs,
  }, { headers: { "Cache-Control": "no-store, private", "Referrer-Policy": "no-referrer" } });
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_DOCUMENT_BYTES + 256_000) return NextResponse.json({ error: "Upload is too large." }, { status: 413 });
  const deal = await getDeal(token);
  if (!deal) return NextResponse.json({ error: "Deal link is invalid or expired." }, { status: 404 });

  const form = await request.formData();
  const action = String(form.get("action") ?? "");
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "A file is required." }, { status: 400 });
  if (file.size < 1 || file.size > MAX_FILE_BYTES || !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Use a PDF, PNG, JPG, or WebP file up to 10 MB." }, { status: 400 });
  }

  if (action === "sign") {
    if (deal.status !== "sent") return NextResponse.json({ error: "This deal can no longer be signed." }, { status: 409 });
    if (file.type !== "image/png") return NextResponse.json({ error: "Signature must be a PNG image." }, { status: 400 });
    const path = `${deal.id}/signature-${randomUUID()}.png`;
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasValidDocumentSignature(bytes, "image/png")) return NextResponse.json({ error: "File content does not match its declared type." }, { status: 400 });
    const { error: uploadError } = await getSupabaseAdmin().storage.from(BUCKET).upload(path, bytes, {
      contentType: "image/png", upsert: false,
    });
    if (uploadError) return NextResponse.json({ error: "Could not save signature." }, { status: 500 });
    const signedAt = new Date().toISOString();
    const nextStatus = deal.required_documents.length === 0 ? "completed" : "signed";
    const { data: updated, error } = await getSupabaseAdmin().from("deals").update({
      status: nextStatus, signature_url: path, signed_at: signedAt,
    }).eq("id", deal.id).eq("status", "sent").select("id").maybeSingle();
    if (error || !updated) {
      await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
      return NextResponse.json({ error: "Deal state changed. Refresh and try again." }, { status: 409 });
    }
    return NextResponse.json({ status: nextStatus, signature_url: await signedUrl(path), signed_at: signedAt });
  }

  if (action === "document") {
    if (deal.status !== "signed" && deal.status !== "completed") {
      return NextResponse.json({ error: "Sign the proposal before uploading documents." }, { status: 403 });
    }
    const label = String(form.get("label") ?? "").trim();
    if (!label || !deal.required_documents.includes(label)) {
      return NextResponse.json({ error: "This document is not requested for the deal." }, { status: 400 });
    }
    const mime = getDocumentMime(file.name, file.type);
    if (!mime) {
      return NextResponse.json({ error: "Unsupported file type. Upload PDF, Office, OpenDocument, RTF, TXT, CSV, JPG, PNG, WebP or HEIC." }, { status: 415 });
    }
    const path = `${deal.id}/documents/${randomUUID()}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasValidDocumentSignature(bytes, mime)) {
      return NextResponse.json({ error: "The file content does not match its extension. Please choose a valid document." }, { status: 400 });
    }
    const { error: uploadError } = await getSupabaseAdmin().storage.from(BUCKET).upload(path, bytes, {
      contentType: mime, upsert: false,
    });
    if (uploadError) return NextResponse.json({ error: "Could not upload document." }, { status: 500 });

    const { data: inserted, error } = await getSupabaseAdmin().from("deal_documents").insert({
      deal_id: deal.id, document_label: label, file_name: file.name.slice(0, 180), file_url: path,
    }).select("id, deal_id, document_label, file_name, file_url, created_at").single();
    if (error || !inserted) {
      await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
      return NextResponse.json({ error: "Could not save document record." }, { status: 500 });
    }
    const { data: allDocs } = await getSupabaseAdmin().from("deal_documents").select("document_label").eq("deal_id", deal.id);
    const uploadedLabels = new Set((allDocs ?? []).map((item) => item.document_label));
    const complete = deal.required_documents.every((item) => uploadedLabels.has(item));
    if (complete && deal.status !== "completed") {
      await getSupabaseAdmin().from("deals").update({ status: "completed" }).eq("id", deal.id).eq("status", "signed");
    }
    return NextResponse.json({
      file: { ...inserted, file_url: await signedUrl(path) },
      status: complete ? "completed" : deal.status,
    });
  }
  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
