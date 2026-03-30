"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    else if (!loading && user && user.role !== "ADMIN") router.replace("/");
  }, [user, loading, router]);

  if (loading || !user) return <p className="text-slate-600">Loading…</p>;
  if (user.role !== "ADMIN") return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
        <p className="text-slate-600">Create and manage events on the platform.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/events"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-amber-300"
        >
          <h2 className="font-semibold text-slate-900">Manage events</h2>
          <p className="mt-1 text-sm text-slate-600">List, edit, or delete events.</p>
        </Link>
        <Link
          href="/admin/events/new"
          className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm hover:bg-amber-100"
        >
          <h2 className="font-semibold text-amber-900">Create event</h2>
          <p className="mt-1 text-sm text-amber-800">Add a new event for sellers to list against.</p>
        </Link>
      </div>
    </div>
  );
}
