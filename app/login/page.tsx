"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { AppFooter } from "@/components/app-footer";
import { supabase } from "@/lib/supabase";

type Mode = "sign-in" | "sign-up";

export default function LoginPage() {
  const nextPath = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("next") === "/signatures/new" ? "/signatures/new" : "/dashboard";
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "signup") void Promise.resolve().then(() => setMode("sign-up"));
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace(nextPath);
    });
  }, [nextPath]);

  async function signInWithProvider(provider: "google" | "azure" | "linkedin_oidc") {
    setError("");
    setNotice("");
    setPending(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}${nextPath}`,
        ...(provider === "azure" ? { scopes: "email" } : {}),
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setPending(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);

    if (mode === "sign-up") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      setPending(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        window.location.replace("/dashboard");
        return;
      }
      setNotice("Account created. Check your email to confirm your account. You should then be redirected to your dashboard.");
      setMode("sign-in");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setPending(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    window.location.replace(nextPath);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Logo />
          <Link href="/" className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">← Back to home</Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-10">
        <section className="w-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand">
            Agency access
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-slate-950">
            {mode === "sign-in" ? "Sign in" : "Create your studio"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in securely to manage your proposals, agreements, and client documents.
          </p>

          <div className="mt-5 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100/90 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("sign-in");
                setError("");
                setNotice("");
              }}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                mode === "sign-in"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("sign-up");
                setError("");
                setNotice("");
              }}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                mode === "sign-up"
                  ? "bg-white text-slate-950 shadow-xs"
                  : "text-slate-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="mt-6 space-y-2.5">
            <button type="button" disabled={pending} onClick={() => signInWithProvider("google")} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:bg-slate-50 disabled:opacity-60">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M21.35 12.25c0-.73-.07-1.42-.19-2.1H12v3.97h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.25Z"/><path fill="#34A853" d="M12 21.75c2.63 0 4.83-.87 6.44-2.35l-3.14-2.44c-.87.58-1.98.93-3.3.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52a9.75 9.75 0 0 0 8.7 5.37Z"/><path fill="#FBBC05" d="M6.54 13.86a5.85 5.85 0 0 1 0-3.72V7.62H3.3a9.75 9.75 0 0 0 0 8.76l3.24-2.52Z"/><path fill="#EA4335" d="M12 6.11c1.43 0 2.71.49 3.72 1.46l2.79-2.79A9.3 9.3 0 0 0 12 2.25a9.75 9.75 0 0 0-8.7 5.37l3.24 2.52C7.31 7.83 9.46 6.11 12 6.11Z"/></svg>
              Continue with Google
            </button>
            <button type="button" disabled={pending} onClick={() => signInWithProvider("azure")} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:bg-slate-50 disabled:opacity-60">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#F25022" d="M2 2h9v9H2z"/><path fill="#7FBA00" d="M13 2h9v9h-9z"/><path fill="#00A4EF" d="M2 13h9v9H2z"/><path fill="#FFB900" d="M13 13h9v9h-9z"/></svg>
              Continue with Microsoft
            </button>
            <button type="button" disabled={pending} onClick={() => signInWithProvider("linkedin_oidc")} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:bg-slate-50 disabled:opacity-60">
              <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded bg-[#0A66C2] text-xs font-extrabold text-white">in</span>
              Continue with LinkedIn
            </button>
          </div>
          <div className="mt-6 flex items-center gap-3 text-xs font-medium text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with email<span className="h-px flex-1 bg-slate-200" /></div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-700">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none ring-brand focus:bg-white focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-700">
                Password
              </span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none ring-brand focus:bg-white focus:ring-2"
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                {notice}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white transition-colors hover:bg-[#4338ca] disabled:opacity-60"
            >
              {pending
                ? "Please wait…"
                : mode === "sign-in"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
