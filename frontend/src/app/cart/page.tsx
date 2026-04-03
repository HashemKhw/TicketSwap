"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatUsd } from "@/lib/money";

export default function CartPage() {
  const { lines, setQty, removeLine, subtotal, clear } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="page-shell space-y-8">
      <div>
        <span className="eyebrow">Checkout flow</span>
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)]">Cart</h1>
      </div>
      {lines.length === 0 ? (
        <div className="surface-card empty-state">
          Your cart is empty.{" "}
          <Link href="/events" className="font-semibold text-[var(--primary)] hover:underline">
            Browse events
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {lines.map((l) => (
              <li
                key={l.ticketListingId}
                className="surface-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                    In your cart
                  </p>
                  <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
                    {l.eventTitle}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{l.seatInfo}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatUsd(l.unitPrice)} each</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    Qty
                    <input
                      type="number"
                      min={1}
                      value={l.quantity}
                      onChange={(e) =>
                        setQty(l.ticketListingId, Math.max(1, Number(e.target.value) || 1))
                      }
                      className="field-input w-20 py-3"
                    />
                  </label>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {formatUsd(l.unitPrice * l.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeLine(l.ticketListingId)}
                    className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="surface-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Order total
              </p>
              <p className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
                {formatUsd(subtotal)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => clear()}
                className="cta-secondary px-4 py-3 text-sm"
              >
                Clear cart
              </button>
              {!user ? (
                <Link
                  href="/login"
                  className="cta-primary px-4 py-3 text-sm"
                >
                  Log in to checkout
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/checkout")}
                  className="cta-primary px-4 py-3 text-sm"
                >
                  Proceed to checkout
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
