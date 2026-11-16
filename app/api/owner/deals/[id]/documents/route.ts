import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  const authClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const { id } = await context.params;
  const { data: deal } = await supabaseAdmin.from("deals").select("id, user_id, signature_url").eq("id", id).maybeSingle();
  if (!deal || deal.user_id !== user.id) return NextResponse.json({ error: "Deal not found." }, { status: 404 });

  const { data: docs, error } = await supabaseAdmin.from("deal_documents")
    .select("id, deal_id, document_label, file_name, file_url, created_at")
    .eq("deal_id", id).order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Could not load documents." }, { status: 500 });

  const files = await Promise.all((docs ?? []).map(async (doc) => {
    const { data } = await supabaseAdmin.storage.from("deal-vault").createSignedUrl(doc.file_url, 300);
    return { ...doc, file_url: data?.signedUrl ?? null };
  }));
  let signatureUrl: string | null = null;
  if (deal.signature_url) {
    const { data } = await supabaseAdmin.storage.from("deal-vault").createSignedUrl(deal.signature_url, 300);
    signatureUrl = data?.signedUrl ?? null;
  }
  return NextResponse.json({ files, signature_url: signatureUrl }, {
    headers: { "Cache-Control": "no-store, private" },
  });
}
