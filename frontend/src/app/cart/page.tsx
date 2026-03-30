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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
      {lines.length === 0 ? (
        <p className="text-slate-600">
          Your cart is empty.{" "}
          <Link href="/events" className="font-medium text-indigo-600 hover:underline">
            Browse events
          </Link>
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {lines.map((l) => (
              <li
                key={l.ticketListingId}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{l.eventTitle}</p>
                  <p className="text-sm text-slate-600">{l.seatInfo}</p>
                  <p className="text-sm text-slate-500">{formatUsd(l.unitPrice)} each</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Qty
                    <input
                      type="number"
                      min={1}
                      value={l.quantity}
                      onChange={(e) =>
                        setQty(l.ticketListingId, Math.max(1, Number(e.target.value) || 1))
                      }
                      className="w-16 rounded border border-slate-300 px-2 py-1"
                    />
                  </label>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatUsd(l.unitPrice * l.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeLine(l.ticketListingId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-600">Subtotal</p>
              <p className="text-xl font-bold text-slate-900">{formatUsd(subtotal)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => clear()}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Clear cart
              </button>
              {!user ? (
                <Link
                  href="/login"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Log in to checkout
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/checkout")}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
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
