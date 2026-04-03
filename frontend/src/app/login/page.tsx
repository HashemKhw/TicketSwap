"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  signInWithGooglePopup,
  getFirebaseAuth,
  createOrUpdateUserProfile,
} from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [firebasePending, setFirebasePending] = useState(false);

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

  async function onFirebaseEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setFirebasePending(true);
    try {
      const auth = getFirebaseAuth();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await createOrUpdateUserProfile(cred.user);
      router.push("/dashboard");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Firebase login failed");
    } finally {
      setFirebasePending(false);
    }
  }

  async function onGoogleLogin() {
    setErr(null);
    setFirebasePending(true);
    try {
      const cred = await signInWithGooglePopup();
      await createOrUpdateUserProfile(cred.user);
      router.push("/dashboard");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Google login failed");
    } finally {
      setFirebasePending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
      <p className="mt-1 text-sm text-slate-600">
        No account?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in (API auth) "}
        </button>
      </form>
      <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Or sign in with Firebase
        </p>
        <form onSubmit={onFirebaseEmailLogin} className="space-y-3">
          <button
            type="submit"
            disabled={firebasePending}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            {firebasePending ? "Signing in…" : "Sign in with email (Firebase)"}
          </button>
        </form>
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={firebasePending}
          className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-60"
        >
          {firebasePending ? "Connecting…" : "Continue with Google (Firebase)"}
        </button>
      </div>
    </div>
  );
}
