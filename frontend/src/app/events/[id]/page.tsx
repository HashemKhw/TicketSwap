/* eslint-disable @next/next/no-img-element */
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
      <div className="page-shell surface-card rounded-2xl bg-red-50 p-6 text-red-800">
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
    <div className="page-shell space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] editorial-gradient px-6 py-10 text-white md:px-10 md:py-14">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_35%)]" />
        <div className="absolute inset-0 bg-[rgba(25,28,30,0.35)]" />
        <div className="relative z-10">
          <Link href="/events" className="text-sm font-semibold text-white/80 hover:text-white">
            ← Back to events
          </Link>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur">
              Verified resale
            </span>
            <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur">
              {listings.length} listing{listings.length === 1 ? "" : "s"}
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.05em] md:text-6xl">
            {event.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-white/80">
            <span className="info-chip bg-white/14 text-white">{event.location}</span>
            <span className="info-chip bg-white/14 text-white">{formatDate(event.date)}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="surface-card p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
              About the event
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">{event.description}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] bg-[var(--surface-low)] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Venue
                </p>
                <p className="mt-2 font-semibold text-[var(--foreground)]">{event.location}</p>
              </div>
              <div className="rounded-[1.25rem] bg-[var(--surface-low)] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Schedule
                </p>
                <p className="mt-2 font-semibold text-[var(--foreground)]">{formatDate(event.date)}</p>
              </div>
            </div>
          </div>

          {listings.length === 0 && (
            <div className="surface-card empty-state">
              No tickets listed yet. Check back soon or create the first listing from your dashboard.
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
              Available tickets
            </h2>
            <span className="rounded-full bg-[var(--surface-high)] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
              {listings.length} active
            </span>
          </div>
          <div className="space-y-4">
            {listings.map((l) => {
              const unit = listingUnitPrice(l.price);
              const max = l.quantity;
              const q = qty[l.id] ?? 1;
              const isOwn = user?.id === l.sellerId;
              return (
                <div key={l.id} className="surface-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                        {l.seatInfo || "General admission"}
                      </p>
                      <p className="mt-2 text-xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
                        {formatUsd(unit)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        Seller: {l.seller?.email ?? "—"} · {l.quantity} ticket
                        {l.quantity === 1 ? "" : "s"} left
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {l.ticketType === "MOBILE_TRANSFER" ? "Mobile Transfer" : "PDF"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[rgba(138,76,252,0.1)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--secondary)]">
                      Verified
                    </span>
                  </div>
                  <div className="subtle-divider mt-5 pt-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-sm font-medium text-[var(--muted)]">
                        Quantity
                      </label>
                      <select
                        value={q}
                        onChange={(e) =>
                          setQty((prev) => ({
                            ...prev,
                            [l.id]: Math.min(max, Math.max(1, Number(e.target.value) || 1)),
                          }))
                        }
                        className="field-input max-w-32 py-3"
                      >
                        {Array.from({ length: max }, (_, index) => index + 1).map((amount) => (
                          <option key={amount} value={amount}>
                            {amount} ticket{amount === 1 ? "" : "s"}
                          </option>
                        ))}
                      </select>
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
                        className="cta-primary ml-auto px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {!user ? "Log in to add" : isOwn ? "Your listing" : "Add to cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
