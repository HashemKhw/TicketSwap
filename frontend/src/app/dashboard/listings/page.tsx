"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { deleteListing, fetchMyListings } from "@/lib/api";
import { formatUsd, toNumber } from "@/lib/money";
import type { TicketListing } from "@/lib/types";

export default function MyListingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<TicketListing[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchMyListings()
      .then((r) => setListings(r.listings))
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"));
  }, [user]);

  async function remove(id: string) {
    if (!confirm("Delete this listing?")) return;
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading || !user) return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Seller inventory</span>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
            My listings
          </h1>
        </div>
        <Link
          href="/sell/new"
          className="cta-primary px-5 py-3 text-sm"
        >
          New listing
        </Link>
      </div>
      {err && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
      <ul className="space-y-3">
        {listings.map((l) => (
          <li
            key={l.id}
            className="surface-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Active listing
              </p>
              <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
                {l.event?.title ?? "Event"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{l.seatInfo}</p>
              <p className="mt-2 text-sm text-slate-500">
                {formatUsd(toNumber(l.price))} · Qty {l.quantity}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/listings/${l.id}/edit`}
                className="cta-secondary px-4 py-2.5 text-sm"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => remove(l.id)}
                className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {listings.length === 0 && !err && (
        <div className="surface-card empty-state">You have no listings yet.</div>
      )}
    </div>
  );
}
