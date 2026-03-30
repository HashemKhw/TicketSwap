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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">My listings</h1>
        <Link
          href="/sell/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          New listing
        </Link>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <ul className="space-y-3">
        {listings.map((l) => (
          <li
            key={l.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">{l.event?.title ?? "Event"}</p>
              <p className="text-sm text-slate-600">{l.seatInfo}</p>
              <p className="text-sm text-slate-500">
                {formatUsd(toNumber(l.price))} · Qty {l.quantity}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/listings/${l.id}/edit`}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => remove(l.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {listings.length === 0 && !err && (
        <p className="text-slate-600">You have no listings yet.</p>
      )}
    </div>
  );
}
