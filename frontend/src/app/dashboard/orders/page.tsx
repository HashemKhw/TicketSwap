"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchMyOrders } from "@/lib/api";
import { formatUsd, toNumber } from "@/lib/money";
import type { Order } from "@/lib/types";

export default function MyOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchMyOrders()
      .then((r) => setOrders(r.orders))
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [user]);

  if (loading || !user) return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="page-shell space-y-8">
      <div>
        <span className="eyebrow">Buyer history</span>
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
          My orders
        </h1>
      </div>
      {err && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
                  Purchase
                </p>
                <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
                  {o.listing?.event?.title ?? "Event"} — {o.listing?.seatInfo}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Qty {o.quantity} · {formatUsd(toNumber(o.totalPrice))}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={
                  o.status === "PAID"
                    ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                    : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
                }
              >
                {o.status}
              </span>
            </div>
            {o.listing?.event?.id && (
              <Link
                href={`/events/${o.listing.event.id}`}
                className="mt-4 inline-block text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                View event
              </Link>
            )}
          </li>
        ))}
      </ul>
      {orders.length === 0 && !err && (
        <div className="surface-card empty-state">No orders yet.</div>
      )}
    </div>
  );
}
