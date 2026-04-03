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
    <div className="page-shell space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="eyebrow">Seller dashboard</span>
          <h1 className="page-heading mt-5 max-w-3xl">
            Welcome back.
            <br />
            <span className="text-[var(--primary)]">Your ticket portfolio</span> is ready.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)]">
            Signed in as {user.email}. Review your active listings, recent orders, and completed
            sales from one premium dashboard.
          </p>
        </div>
        <div className="surface-card editorial-gradient p-8 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            Quick action
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Sell your next ticket.</h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/80">
            Reach buyers instantly by creating a polished listing tied to an admin-approved event.
          </p>
          <Link href="/sell/new" className="mt-8 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[var(--primary)]">
            Create listing
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/dashboard/listings"
          className="surface-card p-6 transition hover:-translate-y-1"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            Inventory
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
            My listings
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Create, edit, or remove tickets you sell.
          </p>
        </Link>
        <Link
          href="/dashboard/orders"
          className="surface-card p-6 transition hover:-translate-y-1"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
            Buying
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
            My orders
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Purchases and payment status.</p>
        </Link>
        <Link
          href="/dashboard/sales"
          className="surface-card p-6 transition hover:-translate-y-1"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tertiary)]">
            Revenue
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
            My sales
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Buyers who completed checkout for your listings.
          </p>
        </Link>
        <Link
          href="/sell/new"
          className="surface-card editorial-gradient p-6 text-white transition hover:-translate-y-1"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Launch</p>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em]">Create listing</h2>
          <p className="mt-3 text-sm leading-6 text-white/80">List tickets for an event.</p>
        </Link>
      </section>
    </div>
  );
}
