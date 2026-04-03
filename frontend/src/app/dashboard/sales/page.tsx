"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchMySales } from "@/lib/api";
import { formatUsd, toNumber } from "@/lib/money";
import type { Order } from "@/lib/types";

export default function MySalesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchMySales()
      .then((r) => setOrders(r.orders))
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [user]);

  if (loading || !user) return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="page-shell space-y-8">
      <div>
        <span className="eyebrow">Seller revenue</span>
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
          My sales
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Completed purchases from buyers for your listings.
        </p>
      </div>
      {err && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="surface-card p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tertiary)]">
              Completed sale
            </p>
            <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
              {o.listing?.event?.title ?? "Event"} — {o.listing?.seatInfo}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Buyer: {o.buyer?.email} · Qty {o.quantity} ·{" "}
              {formatUsd(toNumber(o.totalPrice))}
            </p>
            <p className="mt-2 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      {orders.length === 0 && !err && <div className="surface-card empty-state">No paid sales yet.</div>}
    </div>
  );
}
