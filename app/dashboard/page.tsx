"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { AppFooter } from "@/components/app-footer";
import { formatMoney, formatWhen, magicLink, normalizeDeal } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Deal, DealDocument, DealStatus } from "@/lib/types";

type SignatureRequest = { id:string;token:string;title:string;signer_name:string;signer_email:string;signed_at:string|null;created_at:string;expires_at:string;revoked_at:string|null;signed_pdf_path?:string|null };

const BADGE: Record<DealStatus, string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  sent: "border-indigo-200 bg-indigo-50 text-indigo-700",
  signed: "border-amber-200 bg-amber-50 text-amber-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([]);
  const [signatureError, setSignatureError] = useState("");
  const [signatureLoading, setSignatureLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");
  const [linkSettings, setLinkSettings] = useState<Record<string, { revoked: boolean; expires: string | null }>>({});
  const [savingLink, setSavingLink] = useState("");
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [linkControlsReady, setLinkControlsReady] = useState(false);
  const [active, setActive] = useState<Deal | null>(null);
  const [files, setFiles] = useState<DealDocument[]>([]);
  const [filesError, setFilesError] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [signatureFailed, setSignatureFailed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setCurrentTime(Date.now());
      const user = data.session?.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email ?? "");
      try {
        const response = await fetch("/api/signatures", {headers:{Authorization:`Bearer ${data.session?.access_token}`},cache:"no-store"});
        const result = await response.json();
        if (!response.ok) throw Error(result.error || "Could not load signature requests.");
        setSignatureRequests(result.requests ?? []);
      } catch (cause) {setSignatureError(cause instanceof Error ? cause.message : "Could not load signature requests.");}
      finally {setSignatureLoading(false);}
      let { data: rows, error: queryError } = await supabase
        .from("deals")
        .select(
          "id, slug, client_name, client_email, project_title, currency, amount, status, signature_url, signed_at, created_at, proposal, required_documents, link_expires_at, link_revoked_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError?.code === "42703") {
        const fallback = await supabase.from("deals").select("id, slug, client_name, client_email, project_title, currency, amount, status, signature_url, signed_at, created_at, proposal, required_documents").eq("user_id", user.id).order("created_at", { ascending: false });
        rows = (fallback.data ?? []).map((row) => ({ ...row, link_expires_at: null, link_revoked_at: null }));
        queryError = fallback.error;
      } else if (!queryError) {
        setLinkControlsReady(true);
      }
      if (queryError) setError(queryError.message);
      else {
        setDeals((rows ?? []).map((row) => normalizeDeal(row)));
        setLinkSettings(Object.fromEntries((rows ?? []).map((row) => [row.id, { revoked: Boolean(row.link_revoked_at), expires: row.link_expires_at ?? null }])));
      }
      setReady(true);
    });
  }, [router]);

  async function changeLinkAccess(id: string, action: "revoke" | "restore" | "expire") {
    setError("");
    setSavingLink(id);
    const updates = action === "revoke"
      ? { link_revoked_at: new Date().toISOString() }
      : action === "restore"
        ? { link_revoked_at: null, link_expires_at: null }
        : { link_expires_at: new Date(Date.now() + 7 * 86400000).toISOString() };
    const { error: updateError } = await supabase.from("deals").update(updates).eq("id", id);
    if (updateError) setError(updateError.message);
    else setLinkSettings((current) => ({
      ...current,
      [id]: {
        revoked: action === "revoke" ? true : action === "restore" ? false : Boolean(current[id]?.revoked),
        expires: action === "restore" ? null : action === "expire" ? updates.link_expires_at ?? null : current[id]?.expires ?? null,
      },
    }));
    setSavingLink("");
  }

  async function copyLink(slug: string) {
    await navigator.clipboard.writeText(magicLink(slug));
    setCopiedSlug(slug);
  }

  async function openDeal(deal: Deal) {
    setActive(deal);
    setFiles([]);
    setFilesError("");
    setSignatureFailed(false);
    setLoadingFiles(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setLoadingFiles(false);
      setFilesError("Your session has expired. Please sign in again.");
      return;
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let response: Response;
      try {
        response = await fetch(`/api/owner/deals/${encodeURIComponent(deal.id)}/documents`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not load documents.");
      setFiles((payload.files ?? []) as DealDocument[]);
      setActive({ ...deal, signature_url: payload.signature_url });
    } catch (cause) {
      setFilesError(cause instanceof Error && cause.name === "AbortError" ? "Document loading timed out. Please try opening this deal again." : cause instanceof Error ? cause.message : "Could not load documents.");
    } finally {
      setLoadingFiles(false);
    }
  }

  async function signOut() {
    setError("");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError("Could not sign out. Please try again.");
      return;
    }
    window.location.replace("/");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading your deal rooms…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-slate-500 sm:inline">{email}</span>
            <button
              type="button"
              onClick={signOut}
              className="text-xs font-semibold text-slate-600 hover:text-slate-950"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex-1 w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand">
              CLIENT WORKSPACE
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-950">
              Your Workspace
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage proposals, documents, and e-signature requests in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2"><Link
            href="/deals/new"
            className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white hover:bg-[#4338ca]"
          >
            + Create New Deal Room
          </Link></div>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {deals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="font-display text-lg font-extrabold text-slate-950">
              No deal rooms yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Publish a proposal and send the client their magic link.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-950">{deal.project_title}</div>
                        <div className="font-mono text-[11px] text-slate-400">{deal.slug}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div>{deal.client_name}</div>
                        <div className="text-xs text-slate-500">{deal.client_email}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs font-semibold">
                        {formatMoney(deal.amount, deal.currency)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${BADGE[deal.status]}`}
                        >
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatWhen(deal.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => copyLink(deal.slug)}
                            disabled={Boolean(linkSettings[deal.id]?.revoked) || Boolean(linkSettings[deal.id]?.expires && currentTime !== null && new Date(linkSettings[deal.id].expires!).getTime() <= currentTime)}
                            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                          >
                            {copiedSlug === deal.slug ? "Copied" : "Copy Client Magic Link"}
                          </button>
                          {linkControlsReady && <button type="button" disabled={savingLink === deal.id} onClick={() => changeLinkAccess(deal.id, linkSettings[deal.id]?.revoked ? "restore" : "revoke")} className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                            {linkSettings[deal.id]?.revoked ? "Restore link" : "Revoke link"}
                          </button>}
                          {linkControlsReady && !linkSettings[deal.id]?.revoked && !linkSettings[deal.id]?.expires && <button type="button" disabled={savingLink === deal.id} onClick={() => changeLinkAccess(deal.id, "expire")} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Set 7-day expiry</button>}
                          {linkControlsReady && linkSettings[deal.id]?.expires && <span className="self-center text-[11px] text-slate-500">Expires {formatWhen(linkSettings[deal.id].expires)}</span>}
                          <button
                            type="button"
                            onClick={() => openDeal(deal)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-brand hover:bg-brand-soft"
                          >
                            View Deal & Files
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <section id="e-signatures" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">E-Sign Activity</p><h2 className="mt-1 text-xl font-extrabold text-slate-950">Your signature requests</h2><p className="mt-1 text-sm text-slate-500">Track standalone signing requests separately from deal rooms.</p></div><Link href="/signatures/new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">New E-Sign Request</Link></div>
          {signatureError&&<p role="alert" className="mt-4 text-sm text-rose-700">{signatureError}</p>}
          {signatureLoading?<p className="mt-5 text-sm text-slate-500">Loading signature requests…</p>:signatureRequests.length===0?<p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">No signature requests yet. Send your first document for e-signature.</p>:<div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Document</th><th className="p-3">Signer</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead><tbody>{signatureRequests.map(item=>{const status=item.signed_at?"Signed":item.revoked_at?"Revoked":currentTime!==null&&new Date(item.expires_at).getTime()<=currentTime?"Expired":"Pending";return <tr key={item.id} className="border-b last:border-0"><td className="p-3"><div className="font-bold text-slate-900">{item.title}</div><div className="text-xs text-slate-500">Created {formatWhen(item.created_at)}</div></td><td className="p-3">{item.signer_name}<div className="text-xs text-slate-500">{item.signer_email}</div></td><td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status==="Signed"?"bg-emerald-100 text-emerald-800":status==="Pending"?"bg-amber-100 text-amber-800":"bg-slate-100 text-slate-600"}`}>{status}</span>{item.signed_at&&<div className="mt-1 text-xs text-slate-500">{formatWhen(item.signed_at)}</div>}</td><td className="p-3"><div className="flex flex-wrap gap-2"><a href={`/sign/${item.token}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border px-3 py-2 text-xs font-semibold text-indigo-700">View request</a>{item.signed_at&&<span className="self-center text-xs text-slate-500">Signature recorded · PDF pending</span>}</div></td></tr>})}</tbody></table></div>}
        </section>
      </main>

      <AppFooter />

      {active ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
          <button
            type="button"
            aria-label="Close deal drawer"
            className="h-full flex-1"
            onClick={() => setActive(null)}
          />
          <aside className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand">
                  Deal room
                </p>
                <h2 className="mt-1 font-display text-xl font-extrabold text-slate-950">
                  {active.project_title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {active.client_name} · {formatMoney(active.amount, active.currency)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Signature
              </h3>
              {loadingFiles ? (
                <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Loading secure signature…</p>
              ) : active.signature_url && !signatureFailed ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {/* Remote signature PNG from the deal vault. */}
                  <img
                    src={active.signature_url}
                    alt={`Signature for ${active.client_name}`}
                    onError={() => setSignatureFailed(true)}
                    className="max-h-36 w-full object-contain"
                  />
                  <p className="mt-2 text-[11px] text-slate-500">
                    Signed {formatWhen(active.signed_at)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">{signatureFailed ? "Signature preview is unavailable. Close and reopen this deal to retry." : active.signed_at ? "The signature image is temporarily unavailable." : "The client has not signed yet."}</p>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Uploaded files
              </h3>
              {loadingFiles ? (
                <p className="text-sm text-slate-500">Loading files…</p>
              ) : null}
              {filesError ? (
                <p className="text-sm text-rose-700">{filesError}</p>
              ) : null}
              {!loadingFiles && !filesError && files.length === 0 ? (
                <p className="text-sm text-slate-500">No files in the vault yet.</p>
              ) : null}
              <ul className="space-y-2">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <p className="text-xs font-semibold text-slate-500">
                      {file.document_label}
                    </p>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-brand hover:underline"
                    >
                      {file.file_name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {active.proposal ? (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Proposal
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                  {active.proposal}
                </p>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
