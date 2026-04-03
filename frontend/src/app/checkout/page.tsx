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
  const [buyerName, setBuyerName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (loading) return <p className="text-slate-600">Loading…</p>;
  if (!user) {
    return (
      <div className="page-shell surface-card rounded-2xl bg-amber-50 p-6 text-amber-900">
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
      <p className="page-shell text-slate-600">
        Cart is empty.{" "}
        <Link href="/events" className="text-[var(--primary)] hover:underline">
          Browse events
        </Link>
      </p>
    );
  }

  async function pay() {
    setErr(null);
    if (buyerName.trim().length < 2) {
      setErr("Enter the buyer full name before checkout.");
      return;
    }
    setPending(true);
    try {
      const items = lines.map((l) => ({
        ticketListingId: l.ticketListingId,
        quantity: l.quantity,
      }));
      const { url } = await createCheckout(buyerName.trim(), items);
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
    <div className="page-shell grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div>
          <span className="eyebrow">Secure checkout</span>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
            Complete purchase
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
            You&apos;ll be redirected to Stripe Checkout in test mode. Use{" "}
            <code className="rounded-full bg-[var(--surface-high)] px-3 py-1 font-semibold">
              4242 4242 4242 4242
            </code>{" "}
            for test payments.
          </p>
        </div>
        <div className="surface-card p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            Payment flow
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">Protected by Stripe</h2>
          <div className="mt-6">
            <label className="field-label">Buyer full name</label>
            <input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Name used for the ticket transfer"
              className="field-input"
            />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] bg-[var(--surface-low)] px-4 py-5 text-center text-sm font-semibold">
              Credit Card
            </div>
            <div className="rounded-[1.25rem] bg-[var(--surface-low)] px-4 py-5 text-center text-sm font-semibold text-slate-500">
              Apple Pay
            </div>
            <div className="rounded-[1.25rem] bg-[var(--surface-low)] px-4 py-5 text-center text-sm font-semibold text-slate-500">
              Google Pay
            </div>
          </div>
          <div className="subtle-divider mt-8 pt-8">
            <p className="text-sm leading-7 text-[var(--muted)]">
              Your order is confirmed on the return page after Stripe redirects you back to
              TicketSwap.
            </p>
          </div>
        </div>
      </section>
      <aside className="space-y-5">
        <div className="surface-card overflow-hidden p-8">
          <div className="h-1 w-full rounded-full editorial-gradient" />
          <h2 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
            Order summary
          </h2>
          <ul className="mt-6 space-y-4">
            {lines.map((l) => (
              <li
                key={l.ticketListingId}
                className="flex items-start justify-between gap-4 rounded-[1.25rem] bg-[var(--surface-low)] px-4 py-4 text-sm"
              >
                <span className="leading-6 text-[var(--muted)]">
                  {l.eventTitle} — {l.seatInfo} × {l.quantity}
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  {formatUsd(l.unitPrice * l.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="subtle-divider mt-6 flex items-center justify-between pt-5">
            <span className="text-lg font-bold">Total</span>
            <span className="text-3xl font-bold tracking-[-0.03em] text-[var(--primary)]">
              {formatUsd(subtotal)}
            </span>
          </div>
          {err && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          <div className="mt-6 flex gap-3">
            <Link href="/cart" className="cta-secondary px-4 py-3 text-sm">
              Back to cart
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={pay}
              className="cta-primary flex-1 px-4 py-3 text-sm disabled:opacity-60"
            >
              {pending ? "Redirecting…" : "Pay with Stripe"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
