"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { AppFooter } from "@/components/app-footer";
import { ProposalView } from "@/components/proposal-view";
import { magicLink, makeSlug } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { CURRENCIES, type Currency } from "@/lib/types";

const DEFAULT_DOCS = ["Signed NDA", "Brand Assets / Logo", "GST / Tax ID"];
const PROPOSAL_TEMPLATES = [
  { id: "custom", name: "Start from scratch", brief: "", documents: DEFAULT_DOCS },
  { id: "website", name: "Website Development", brief: "Design and develop a responsive business website. Include discovery, UX/UI design, development, testing, deployment, milestones, deliverables, revision limits, client responsibilities, and exclusions.", documents: ["Brand Assets / Logo", "Website Content", "Domain / Hosting Details"] },
  { id: "marketing", name: "Digital Marketing", brief: "Provide a digital marketing engagement covering discovery, channel strategy, campaign setup, reporting cadence, KPIs, deliverables, approvals, ad spend exclusions, and monthly responsibilities.", documents: ["Brand Guidelines", "Existing Marketing Assets", "Account Access Details"] },
  { id: "consulting", name: "Business Consulting", brief: "Provide a consulting engagement covering objectives, discovery workshops, analysis, recommendations, deliverables, timeline, assumptions, stakeholder responsibilities, and exclusions.", documents: ["Project Requirements", "Existing Business Documents", "Signed NDA"] },
  { id: "design", name: "Brand & Creative Design", brief: "Create a visual identity and brand design package covering research, concepts, logo deliverables, brand guidelines, revisions, file formats, handoff, usage rights, and exclusions.", documents: ["Creative Brief", "Brand References", "Existing Brand Assets"] },
] as const;

export default function NewDealPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState("");
  const [brief, setBrief] = useState("");
  const [templateId, setTemplateId] = useState("custom");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [documents, setDocuments] = useState<string[]>(DEFAULT_DOCS);
  const [docDraft, setDocDraft] = useState("");
  const [proposal, setProposal] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setReady(true);
    });
  }, [router]);

  function chooseTemplate(id: string) {
    const template = PROPOSAL_TEMPLATES.find((item) => item.id === id);
    if (!template) return;
    setTemplateId(id);
    setBrief(template.brief);
    setDocuments([...template.documents]);
    setProposal("");
    setError("");
  }

  function exportProposalPdf() {
    if (!proposal.trim()) return;
    // The browser's native print dialog provides PDF export without a paid service.
    setPreviewOpen(true);
    window.setTimeout(() => window.print(), 120);
  }

  function addDocument() {
    const next = docDraft.trim();
    if (!next) return;
    setDocuments((current) => [...current, next]);
    setDocDraft("");
  }

  async function generateProposal() {
    setError("");
    setGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          clientName,
          clientEmail,
          projectTitle,
          currency,
          amount: Number(amount),
          brief,
          requiredDocuments: documents,
        }),
      });
      const raw = await response.text();
      let payload: { proposal?: string; error?: string } = {};
      if (raw) {
        try {
          payload = JSON.parse(raw) as typeof payload;
        } catch {
          throw new Error(`The proposal service returned an invalid response (HTTP ${response.status}). Please try again.`);
        }
      }
      if (!response.ok || !payload.proposal) {
        const fallback = response.status === 504 || response.status === 408
          ? "AI proposal generation timed out. Please try again."
          : response.status === 401
            ? "Your session has expired. Sign out and sign in again."
            : `The proposal service did not return a proposal (HTTP ${response.status}). Please try again.`;
        throw new Error(payload.error || fallback);
      }
      setProposal(payload.proposal);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate the proposal.");
    } finally {
      setGenerating(false);
    }
  }

  async function publishDeal(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!proposal.trim()) {
      setError("Generate a proposal before publishing the deal link.");
      return;
    }
    const cleanDocs = documents.map((item) => item.trim()).filter(Boolean);
    if (!cleanDocs.length) {
      setError("Add at least one required document.");
      return;
    }

    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const slug = makeSlug(projectTitle);
    const { error: insertError } = await supabase.from("deals").insert({
      user_id: user.id,
      slug,
      client_name: clientName.trim(),
      client_email: clientEmail.trim(),
      project_title: projectTitle.trim(),
      currency,
      amount: Number(amount),
      status: "sent",
      proposal: proposal.trim(),
      required_documents: cleanDocs,
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    setPublishedSlug(slug);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(magicLink(publishedSlug));
    setCopied(true);
  }

  function shareByEmail() {
    const url = magicLink(publishedSlug);
    const subject = encodeURIComponent(`Proposal for ${projectTitle}`);
    const body = encodeURIComponent(
      `Hello ${clientName},\\n\\nPlease review your proposal and complete the signing and document steps using this secure link:\\n${url}\\n\\nRegards`,
    );
    window.location.href = `mailto:${encodeURIComponent(clientEmail)}?subject=${subject}&body=${body}`;
  }

  function shareByWhatsApp() {
    const url = magicLink(publishedSlug);
    const message = encodeURIComponent(
      `Hello ${clientName}, please review your proposal and complete the signing and document steps using this secure link: ${url}`,
    );
    window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Opening the studio…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo href="/dashboard" />
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto flex-1 grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-12 sm:px-6 lg:px-8">
        <form
          onSubmit={publishDeal}
          className="space-y-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs lg:col-span-7"
        >
          <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand font-mono text-xs font-bold text-white">
              01
            </span>
            <div>
              <h1 className="text-sm font-bold text-slate-950">
                AI Proposal & Pricing Composer
              </h1>
              <p className="text-[11px] text-slate-500">
                Enter your project details to draft a proposal. Review the result before sharing.
              </p>
            </div>
          </div>

          <div className="space-y-4 px-5 pb-6 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Client Name">
                <input
                  required
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Client Email">
                <input
                  required
                  type="email"
                  value={clientEmail}
                  onChange={(event) => setClientEmail(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Project Title">
              <input
                required
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Currency">
                <select
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value as Currency)}
                  className={inputClass}
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Deal Amount">
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Proposal Template">
              <select value={templateId} onChange={(event) => chooseTemplate(event.target.value)} className={inputClass}>
                {PROPOSAL_TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
              <p className="mt-1 text-xs text-slate-500">Selecting a template updates the project brief and requested documents. Review them before generating.</p>
            </Field>
            <Field label="Project Scope / Brief">
              <textarea
                required
                rows={5}
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={generateProposal}
                disabled={generating}
                className="rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-[#4338ca] disabled:opacity-60"
              >
                {generating ? "Writing proposal…" : "Generate Proposal with AI"}
              </button>
            </div>

            {proposal ? (
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setPreviewOpen(true)} className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100">Full Preview</button>
                <button type="button" onClick={exportProposalPdf} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50">Export PDF</button>
                <span className="text-xs text-slate-500">Choose “Save as PDF” in the print dialog.</span>
              </div>
            ) : null}
            {proposal ? (
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-brand-deep">
                  AI-Generated Proposal — Review and Edit
                </span>
                <textarea
                  rows={14}
                  value={proposal}
                  onChange={(event) => setProposal(event.target.value)}
                  className={`${inputClass} font-mono text-xs leading-relaxed`}
                />
              </label>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Publishing…" : "Save & Publish Deal Link"}
            </button>

            {publishedSlug ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold text-emerald-900">
                  Deal link is live.
                </p>
                <p className="mt-1 truncate font-mono text-xs text-emerald-800">
                  {magicLink(publishedSlug)}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={shareByEmail}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-emerald-900 ring-1 ring-emerald-200 hover:bg-emerald-100"
                  >
                    <span aria-hidden="true">✉</span> Share by Email
                  </button>
                  <button
                    type="button"
                    onClick={shareByWhatsApp}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e7f9ef] px-3 py-2 text-xs font-bold text-[#075e3b] ring-1 ring-[#b7e7cd] hover:bg-[#d4f3e2]"
                  >
                    <span aria-hidden="true">◉</span> Share on WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-emerald-900 ring-1 ring-emerald-200 hover:bg-emerald-100"
                  >
                    {copied ? "Copied" : "Copy Client Magic Link"}
                  </button>
                  <Link
                    href="/dashboard"
                    className="rounded-lg px-3 py-2 text-center text-xs font-semibold text-emerald-900 underline"
                  >
                    View dashboard
                  </Link>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-emerald-800">
                  Email and WhatsApp open a pre-filled message for you to review and send. No message is sent automatically.
                </p>
              </div>
            ) : null}
          </div>
        </form>

        <section className="h-fit overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 font-mono text-xs font-bold text-white">
                02
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  Client Document Upload Vault
                </h2>
                <p className="text-[11px] text-slate-500">
                  Unlocks automatically right after client signs
                </p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-700">
              {documents.length} Docs
            </span>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <p className="text-xs leading-relaxed text-slate-600">
              Toggle or add the files you need from the client to kick off work.
              They will upload directly into your encrypted vault after signing.
            </p>
            <ul className="space-y-2">
              {documents.map((document, index) => (
                <li
                  key={`${document}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-slate-800">{document}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDocuments((current) => current.filter((_, item) => item !== index))
                    }
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 border-t border-slate-100 pt-3">
              <input
                value={docDraft}
                onChange={(event) => setDocDraft(event.target.value)}
                placeholder="e.g. Company Incorporation Certificate"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addDocument}
                className="shrink-0 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                + Add
              </button>
            </div>
            {proposal ? (
              <div className="rounded-xl border border-brand-border bg-brand-soft/60 p-3">
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-deep">
                  Preview
                </p>
                <ProposalView text={proposal} />
              </div>
            ) : null}
          </div>
        </section>
      </main>
      {previewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 p-3 print:static print:overflow-visible print:bg-white print:p-0 sm:p-8" role="dialog" aria-modal="true" aria-label="Proposal preview">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-2xl print:max-w-none print:rounded-none print:shadow-none">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 print:hidden">
              <h2 className="text-sm font-bold text-slate-950">Proposal Preview</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => window.print()} className="rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white">Save as PDF / Print</button>
                <button type="button" onClick={() => setPreviewOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">Close</button>
              </div>
            </div>
            <div className="space-y-6 p-6 sm:p-10 print:p-0">
              <div className="border-b border-slate-200 pb-6">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">SignDealDocs · Proposal</p>
                <h1 className="mt-3 text-2xl font-extrabold text-slate-950">{projectTitle || "Project Proposal"}</h1>
                <p className="mt-2 text-sm text-slate-600">Prepared for {clientName || "Client"} {clientEmail ? `· ${clientEmail}` : ""}</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">Proposed amount: {currency} {amount || "0"}</p>
              </div>
              <ProposalView text={proposal} />
              <p className="border-t border-slate-200 pt-4 text-xs text-slate-500">Draft proposal — review and confirm all terms before sharing.</p>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`@media print { body > * { visibility: hidden !important; } [role="dialog"], [role="dialog"] * { visibility: visible !important; } [role="dialog"] { position: absolute !important; inset: 0 !important; width: 100% !important; } @page { size: A4; margin: 16mm; } }`}</style>
      <AppFooter />
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none ring-brand focus:bg-white focus:ring-2";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
