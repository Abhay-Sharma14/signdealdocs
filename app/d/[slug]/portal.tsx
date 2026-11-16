"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { ProposalView } from "@/components/proposal-view";
import { SignaturePad, type SignaturePadHandle } from "@/components/signature-pad";
import { formatMoney, formatWhen, normalizeDeal } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Deal, DealDocument } from "@/lib/types";

export function Portal({ slug }: { slug: string }) {
  const padRef = useRef<SignaturePadHandle>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [files, setFiles] = useState<DealDocument[]>([]);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [uploadingLabel, setUploadingLabel] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error: queryError } = await supabase
        .from("deals")
        .select(
          "id, slug, client_name, client_email, project_title, currency, amount, status, signature_url, signed_at, created_at, proposal, required_documents",
        )
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;
      if (queryError || !data) {
        setMissing(true);
        setLoading(false);
        return;
      }
      const nextDeal = normalizeDeal(data);
      setDeal(nextDeal);
      if (nextDeal.status === "signed" || nextDeal.status === "completed") {
        await loadFiles(nextDeal.id);
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function loadFiles(dealId: string) {
    const { data, error: queryError } = await supabase
      .from("deal_documents")
      .select("id, deal_id, document_label, file_name, file_url, created_at")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: true });
    if (queryError) {
      setError(queryError.message);
      return;
    }
    setFiles((data ?? []) as DealDocument[]);
  }

  async function acceptAndSign() {
    if (!deal) return;
    const blob = await padRef.current?.toBlob();
    if (!blob) {
      setError("Draw your signature before accepting the proposal.");
      return;
    }

    setError("");
    setSigning(true);
    const path = `${deal.slug}/signature-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("deal-vault")
      .upload(path, blob, { contentType: "image/png", upsert: false });

    if (uploadError) {
      setSigning(false);
      setError(uploadError.message);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("deal-vault").getPublicUrl(path);
    const signedAt = new Date().toISOString();
    const nextStatus = deal.required_documents.length === 0 ? "completed" : "signed";
    const { error: updateError } = await supabase
      .from("deals")
      .update({
        status: nextStatus,
        signature_url: publicUrl.publicUrl,
        signed_at: signedAt,
      })
      .eq("id", deal.id);

    setSigning(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDeal({
      ...deal,
      status: nextStatus,
      signature_url: publicUrl.publicUrl,
      signed_at: signedAt,
    });
  }

  async function uploadDocument(label: string, file: File | undefined) {
    if (!deal || !file) return;
    setError("");
    setUploadingLabel(label);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `${deal.slug}/docs/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("deal-vault")
      .upload(path, file, { contentType: file.type || "application/octet-stream" });

    if (uploadError) {
      setUploadingLabel("");
      setError(uploadError.message);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("deal-vault").getPublicUrl(path);
    const { data: inserted, error: insertError } = await supabase
      .from("deal_documents")
      .insert({
        deal_id: deal.id,
        document_label: label,
        file_name: file.name,
        file_url: publicUrl.publicUrl,
      })
      .select("id, deal_id, document_label, file_name, file_url, created_at")
      .single();

    if (insertError || !inserted) {
      setUploadingLabel("");
      setError(insertError?.message || "Could not save the document record.");
      return;
    }

    const nextFiles = [...files, inserted as DealDocument];
    const covered = new Set(nextFiles.map((item) => item.document_label));
    const complete = deal.required_documents.every((item) => covered.has(item));
    if (complete && deal.status !== "completed") {
      const { error: updateError } = await supabase
        .from("deals")
        .update({ status: "completed" })
        .eq("id", deal.id);
      if (updateError) {
        setError(updateError.message);
      } else {
        setDeal({ ...deal, status: "completed" });
      }
    }

    setFiles(nextFiles);
    setUploadingLabel("");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Opening the deal room…
      </div>
    );
  }

  if (missing || !deal) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
            <Logo />
          </div>
        </header>
        <main className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-extrabold text-slate-950">
            This deal link is not available
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Ask your agency for a fresh magic link.
          </p>
        </main>
      </div>
    );
  }

  const unlocked = deal.status === "signed" || deal.status === "completed";

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo href="/" />
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print / Save Signed PDF
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <section className="no-print space-y-4 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-950">
              Client Deal & Onboarding Room
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] text-slate-700">
              signdealdocs.com/d/{deal.slug}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            No password required. Review scope, sign digitally, and drop your
            project files below.
          </p>
          <ol className="grid gap-2 sm:grid-cols-2">
            <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800">
              <span className="mr-2 font-mono text-brand">01</span>
              E-Signature {unlocked ? "· Complete" : "· In progress"}
            </li>
            <li
              className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                unlocked
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              <span className="mr-2 font-mono">02</span>
              Document Upload Vault {unlocked ? "· Unlocked" : "· Locked"}
            </li>
          </ol>
        </section>

        <article
          id="deal-document-sheet"
          className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg"
        >
          <div className="bg-slate-950 px-6 py-6 text-white sm:px-8">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-200">
              Proposal
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              {deal.project_title}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Prepared for {deal.client_name}
              {deal.client_email ? ` · ${deal.client_email}` : ""}
            </p>
          </div>
          <div className="space-y-6 px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
              <span className="text-xs font-semibold text-slate-300">
                Total Deal Investment
              </span>
              <span className="font-mono text-lg font-extrabold">
                {formatMoney(deal.amount, deal.currency)}
              </span>
            </div>
            {deal.proposal ? (
              <ProposalView text={deal.proposal} />
            ) : (
              <p className="text-sm text-slate-500">
                The proposal text will appear here once the studio publishes it.
              </p>
            )}

            {deal.signature_url ? (
              <div className="border-t border-dashed border-slate-200 pt-5">
                <h2 className="text-sm font-bold text-slate-950">Accepted signature</h2>
                <img
                  src={deal.signature_url}
                  alt={`Signature of ${deal.client_name}`}
                  className="mt-3 max-h-40 rounded-xl border border-slate-200 bg-white object-contain"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Signed {formatWhen(deal.signed_at)}
                </p>
              </div>
            ) : null}
          </div>
        </article>

        {!unlocked ? (
          <section className="no-print space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Step 1 — E-Signature Pad
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Sign below to lock this agreement and immediately unlock the
                Document Upload Vault.
              </p>
            </div>
            <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-2">
              <SignaturePad ref={padRef} />
              <button
                type="button"
                onClick={() => padRef.current?.clear()}
                className="absolute right-4 top-4 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600"
              >
                Clear
              </button>
            </div>
            {error ? <p className="text-xs text-rose-700">{error}</p> : null}
            <button
              type="button"
              onClick={acceptAndSign}
              disabled={signing}
              className="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white hover:bg-[#4338ca] disabled:opacity-60"
            >
              {signing ? "Saving signature…" : "Accept & Sign Proposal"}
            </button>
          </section>
        ) : (
          <section className="no-print overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg">
            <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
              <h2 className="font-display text-lg font-extrabold text-slate-950">
                Step 2 — Document Upload Vault
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Unlocked after signing. Upload each required document.
              </p>
            </div>
            <div className="space-y-3 p-5">
              {deal.required_documents.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No documents were requested for this engagement.
                </p>
              ) : (
                deal.required_documents.map((label) => {
                  const uploaded = files.filter((file) => file.document_label === label);
                  return (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-200 px-4 py-3"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{label}</p>
                          {uploaded.length ? (
                            <ul className="mt-1 space-y-1">
                              {uploaded.map((file) => (
                                <li key={file.id}>
                                  <a
                                    href={file.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-emerald-700 hover:underline"
                                  >
                                    {file.file_name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500">Waiting for upload</p>
                          )}
                        </div>
                        <label className="text-xs font-semibold text-slate-600">
                          <span className="mb-1 block">
                            {uploadingLabel === label ? "Uploading…" : "Choose file"}
                          </span>
                          <input
                            type="file"
                            disabled={uploadingLabel === label}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              void uploadDocument(label, file);
                              event.target.value = "";
                            }}
                            className="block w-full text-xs"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })
              )}
              {error ? <p className="text-xs text-rose-700">{error}</p> : null}
              {deal.status === "completed" ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                  Vault complete. This deal is marked completed.
                </p>
              ) : null}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
