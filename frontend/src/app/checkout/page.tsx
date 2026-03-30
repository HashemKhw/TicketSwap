"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createCheckout } from "@/lib/api";
import { formatUsd } from "@/lib/money";

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { lines, subtotal } = useCart();
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (loading) return <p className="text-slate-600">Loading…</p>;
  if (!user) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
        Please{" "}
        <Link href="/login" className="font-semibold underline">
          log in
        </Link>{" "}
        to checkout.
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <p className="text-slate-600">
        Cart is empty.{" "}
        <Link href="/events" className="text-indigo-600 hover:underline">
          Browse events
        </Link>
      </p>
    );
  }

  async function pay() {
    setErr(null);
    setPending(true);
    try {
      const items = lines.map((l) => ({
        ticketListingId: l.ticketListingId,
        quantity: l.quantity,
      }));
      const { url } = await createCheckout(items);
      if (url) {
        window.location.href = url;
        return;
      }
      setErr("No checkout URL returned");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
      <p className="text-sm text-slate-600">
        You will be redirected to Stripe Checkout (test mode). Use card{" "}
        <code className="rounded bg-slate-100 px-1">4242 4242 4242 4242</code>.
      </p>
      <ul className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {lines.map((l) => (
          <li key={l.ticketListingId} className="flex justify-between py-2 text-sm">
            <span>
              {l.eventTitle} — {l.seatInfo} × {l.quantity}
            </span>
            <span className="font-medium">{formatUsd(l.unitPrice * l.quantity)}</span>
          </li>
        ))}
        <li className="mt-2 flex justify-between border-t border-slate-200 pt-3 font-semibold">
          <span>Total</span>
          <span>{formatUsd(subtotal)}</span>
        </li>
      </ul>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-3">
        <Link
          href="/cart"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Back to cart
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={pay}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Redirecting…" : "Pay with Stripe"}
        </button>
      </div>
    </div>
  );
}
