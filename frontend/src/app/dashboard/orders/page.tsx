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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My orders</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li
            key={o.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">
                  {o.listing?.event?.title ?? "Event"} — {o.listing?.seatInfo}
                </p>
                <p className="text-sm text-slate-600">
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
                className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
              >
                View event
              </Link>
            )}
          </li>
        ))}
      </ul>
      {orders.length === 0 && !err && (
        <p className="text-slate-600">No orders yet.</p>
      )}
    </div>
  );
}
