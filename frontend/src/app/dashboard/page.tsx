"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return <p className="text-slate-600">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Signed in as {user.email}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/listings"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow"
        >
          <h2 className="font-semibold text-slate-900">My listings</h2>
          <p className="mt-1 text-sm text-slate-600">Create, edit, or remove tickets you sell.</p>
        </Link>
        <Link
          href="/dashboard/orders"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow"
        >
          <h2 className="font-semibold text-slate-900">My orders</h2>
          <p className="mt-1 text-sm text-slate-600">Purchases and payment status.</p>
        </Link>
        <Link
          href="/dashboard/sales"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow"
        >
          <h2 className="font-semibold text-slate-900">My sales</h2>
          <p className="mt-1 text-sm text-slate-600">Buyers who completed checkout for your listings.</p>
        </Link>
        <Link
          href="/sell/new"
          className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm transition hover:bg-indigo-100"
        >
          <h2 className="font-semibold text-indigo-900">Create listing</h2>
          <p className="mt-1 text-sm text-indigo-800">List tickets for an event.</p>
        </Link>
      </div>
    </div>
  );
}
