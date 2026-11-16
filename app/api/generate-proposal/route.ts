import { NextResponse } from "next/server";
import { isCurrency } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";

type GenerateBody = {
  clientName?: string;
  clientEmail?: string;
  projectTitle?: string;
  currency?: string;
  amount?: number | string;
  brief?: string;
  requiredDocuments?: string[];
};

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.replace(/^Bearer\\s+/i, "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!accessToken || !supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Sign in to generate a proposal." }, { status: 401 });
  }
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);
  if (authError || !user) return NextResponse.json({ error: "Your session is invalid. Sign in again." }, { status: 401 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 24_000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const clientName = body.clientName?.trim() ?? "";
  const clientEmail = body.clientEmail?.trim() ?? "";
  const projectTitle = body.projectTitle?.trim() ?? "";
  const brief = body.brief?.trim() ?? "";
  const currency = body.currency?.trim() ?? "";
  const amount = Number(body.amount);
  const requiredDocuments = Array.isArray(body.requiredDocuments)
    ? body.requiredDocuments.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (!clientName || !clientEmail || !projectTitle || !brief || clientName.length > 120 || clientEmail.length > 254 || projectTitle.length > 160 || brief.length > 12000 || requiredDocuments.length > 20 || requiredDocuments.some((item) => item.length > 120)) {
    return NextResponse.json(
      { error: "Client, project title, and project brief are required." },
      { status: 400 },
    );
  }
  if (!isCurrency(currency) || !Number.isFinite(amount) || amount < 0) {
    return NextResponse.json(
      { error: "Provide a valid currency and deal amount." },
      { status: 400 },
    );
  }

  const prompt = `You are an executive proposal writer for a consulting and creative agency.
Write a client-facing proposal in Markdown for the engagement below.
Use these sections exactly, each as a level-2 heading:
## Executive Summary
## Scope of Work
## Deliverables
## Timeline
## Investment
## Terms of Engagement

Rules:
- The total investment must be exactly ${amount} ${currency}. Do not invent a different total.
- Mention the client by name and write in a confident, concise executive tone.
- Deliverables should reflect the brief and list the documents the client must provide after signing.
- Use "-" bullet lists for deliverables, timeline phases, and required client documents.
- Do not wrap the answer in code fences. Do not add a preamble or closing note.

Client: ${clientName}
Client email: ${clientEmail}
Project title: ${projectTitle}
Currency: ${currency}
Deal amount: ${amount}
Project scope / brief:
${brief}

Required documents after signature:
${requiredDocuments.length ? requiredDocuments.map((item) => `- ${item}`).join("\n") : "- None specified"}
`;

  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3-flash-preview"];
  let lastError = "Proposal generation failed.";

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
          signal: AbortSignal.timeout(15000),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        lastError = data?.error?.message || `HTTP ${res.status}`;
        continue;
      }

      const proposal = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (proposal) {
        return NextResponse.json({ proposal });
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Network timeout";
    }
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}