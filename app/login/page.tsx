"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";

type Mode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);

    if (mode === "sign-up") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      setPending(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        router.replace("/dashboard");
        return;
      }
      setNotice("Account created. Check your email to confirm, then sign in.");
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
    router.replace("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Logo />
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
            Email and password. Authenticated studios land on the deal dashboard.
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
    </div>
  );
}
