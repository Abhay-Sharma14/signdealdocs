import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const BUCKET = "deal-vault";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

type DealRow = {
  id: string; slug: string; client_name: string; client_email: string;
  project_title: string; currency: string; amount: number; status: string;
  signature_url: string | null; signed_at: string | null; created_at: string;
  proposal: string | null; required_documents: string[];
};

async function getDeal(token: string) {
  if (!/^[a-z0-9-]{40,100}$/i.test(token)) return null;
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

  const { data: rows, error } = await supabaseAdmin
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
    deal: { ...deal, signature_url: await signedUrl(deal.signature_url) },
    files: docs,
  }, { headers: { "Cache-Control": "no-store, private", "Referrer-Policy": "no-referrer" } });
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
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
    const { error: uploadError } = await getSupabaseAdmin().storage.from(BUCKET).upload(path, bytes, {
      contentType: "image/png", upsert: false,
    });
    if (uploadError) return NextResponse.json({ error: "Could not save signature." }, { status: 500 });
    const signedAt = new Date().toISOString();
    const nextStatus = deal.required_documents.length === 0 ? "completed" : "signed";
    const { error } = await getSupabaseAdmin().from("deals").update({
      status: nextStatus, signature_url: path, signed_at: signedAt,
    }).eq("id", deal.id).eq("status", "sent");
    if (error) {
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
    const path = `${deal.id}/documents/${randomUUID()}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await getSupabaseAdmin().storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type, upsert: false,
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
