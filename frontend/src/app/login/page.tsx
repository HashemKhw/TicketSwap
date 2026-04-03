"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setPending(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-md overflow-hidden py-8">
      <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-[rgba(53,37,205,0.09)] blur-3xl" />
      <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-[rgba(113,42,226,0.09)] blur-3xl" />
      <div className="relative surface-card px-8 py-10 md:px-10">
        <div className="mb-8">
          <span className="eyebrow">Access your account</span>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.05em] text-[var(--foreground)]">
            Log in
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            No account?{" "}
            <Link href="/register" className="font-semibold text-[var(--primary)] hover:underline">
              Register
            </Link>
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="field-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
            />
          </div>
          {err && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{err}</p>
          )}
          <button type="submit" disabled={pending} className="cta-primary w-full px-5 py-4 text-sm disabled:opacity-60">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
