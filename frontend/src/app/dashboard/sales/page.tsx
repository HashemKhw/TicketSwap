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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My sales</h1>
      <p className="text-slate-600">Completed purchases from buyers for your listings.</p>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li
            key={o.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="font-medium text-slate-900">
              {o.listing?.event?.title ?? "Event"} — {o.listing?.seatInfo}
            </p>
            <p className="text-sm text-slate-600">
              Buyer: {o.buyer?.email} · Qty {o.quantity} ·{" "}
              {formatUsd(toNumber(o.totalPrice))}
            </p>
            <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      {orders.length === 0 && !err && <p className="text-slate-600">No paid sales yet.</p>}
    </div>
  );
}
