"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchEvent } from "@/lib/api";
import { formatUsd, toNumber } from "@/lib/money";
import { useAuth } from "@/context/AuthContext";
import { useCart, listingUnitPrice } from "@/context/CartContext";
import type { Event, TicketListing } from "@/lib/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function EventDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { user } = useAuth();
  const { addLine } = useCart();
  const [event, setEvent] = useState<(Event & { listings: TicketListing[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchEvent(id)
      .then((r) => setEvent(r.event))
      .catch((e) => setError(e instanceof Error ? e.message : "Not found"));
  }, [id]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        {error}{" "}
        <Link href="/events" className="font-medium underline">
          Back to events
        </Link>
      </div>
    );
  }

  if (!event) {
    return <p className="text-slate-600">Loading…</p>;
  }

  const listings = event.listings ?? [];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/events" className="text-sm font-medium text-indigo-600 hover:underline">
          ← Events
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{event.title}</h1>
        <p className="mt-2 text-slate-600">{event.description}</p>
        <p className="mt-2 text-sm text-slate-500">
          {event.location} · {formatDate(event.date)}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Ticket listings</h2>
        {listings.length === 0 && (
          <p className="mt-2 text-slate-600">No tickets listed yet.</p>
        )}
        <ul className="mt-4 space-y-3">
          {listings.map((l) => {
            const unit = listingUnitPrice(l.price);
            const max = l.quantity;
            const q = qty[l.id] ?? 1;
            const isOwn = user?.id === l.sellerId;
            return (
              <li
                key={l.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{l.seatInfo || "General admission"}</p>
                  <p className="text-sm text-slate-500">
                    Seller: {l.seller?.email ?? "—"} · {l.quantity} left
                  </p>
                  <p className="mt-1 text-lg font-semibold text-indigo-700">{formatUsd(unit)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Qty
                    <input
                      type="number"
                      min={1}
                      max={max}
                      value={q}
                      onChange={(e) =>
                        setQty((prev) => ({
                          ...prev,
                          [l.id]: Math.min(max, Math.max(1, Number(e.target.value) || 1)),
                        }))
                      }
                      className="w-16 rounded border border-slate-300 px-2 py-1"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={isOwn || !user}
                    onClick={() =>
                      addLine({
                        ticketListingId: l.id,
                        unitPrice: toNumber(l.price),
                        seatInfo: l.seatInfo || "GA",
                        eventTitle: event.title,
                        eventId: event.id,
                        quantity: q,
                      })
                    }
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {!user ? "Log in to add" : isOwn ? "Your listing" : "Add to cart"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
