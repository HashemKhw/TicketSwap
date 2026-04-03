"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchEvents } from "@/lib/api";

export default function AdminHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    else if (!loading && user && user.role !== "ADMIN") router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetchEvents()
      .then((response) => setEventCount(response.events.length))
      .catch(() => setEventCount(0));
  }, [user]);

  if (loading || !user) return <p className="text-slate-600">Loading…</p>;
  if (user.role !== "ADMIN") return null;

  return (
    <div className="page-shell space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="eyebrow">Admin control room</span>
          <h1 className="page-heading mt-5 max-w-3xl">
            Marketplace
            <br />
            <span className="text-[var(--primary)]">content operations.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)]">
            Create and manage events on the platform while keeping seller inventory anchored to a
            trusted event catalog.
          </p>
        </div>
        <div className="surface-card editorial-gradient p-8 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            Live catalog
          </p>
          <p className="mt-4 text-5xl font-bold tracking-[-0.05em]">{eventCount}</p>
          <p className="mt-3 text-sm leading-7 text-white/80">
            Events currently available for sellers to list against.
          </p>
        </div>
      </section>
      <div className="grid gap-5 sm:grid-cols-2">
        <Link
          href="/admin/events"
          className="surface-card p-7 transition hover:-translate-y-1"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            Catalog
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
            Manage events
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">List, edit, or delete events.</p>
        </Link>
        <Link
          href="/admin/events/new"
          className="surface-card bg-amber-50 p-7 transition hover:-translate-y-1"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
            New launch
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-amber-950">Create event</h2>
          <p className="mt-3 text-sm leading-6 text-amber-900/80">
            Add a new event for sellers to list against.
          </p>
        </Link>
      </div>
    </div>
  );
}
