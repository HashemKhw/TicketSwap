"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { fetchEvents } from "@/lib/api";
import type { Event } from "@/lib/types";

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents()
      .then((r) => {
        const sorted = [...r.events].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setEvents(sorted.slice(0, 6));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load events"));
  }, []);

  return (
    <div className="page-shell">
      <section className="grid gap-10 overflow-hidden rounded-[2rem] px-6 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-14">
        <div className="space-y-7">
          <span className="eyebrow">Premium ticket exchange</span>
          <div className="space-y-5">
            <h1 className="page-heading max-w-3xl">
              Find tickets.
              <br />
              <span className="text-[var(--primary)]">Sell seats</span> you can&apos;t use.
            </h1>
            <p className="max-w-xl text-base leading-8 text-[var(--muted)] md:text-lg">
              Browse live events, compare verified resale inventory, and move from discovery to
              secure checkout with a premium marketplace flow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/events" className="cta-primary px-6 py-3.5 text-sm">
              Browse all events
            </Link>
            <Link href="/sell/new" className="cta-secondary px-6 py-3.5 text-sm">
              Start selling
            </Link>
          </div>
          <div className="grid gap-3 pt-3 sm:grid-cols-3">
            <div className="surface-card p-4 shadow-none">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                Verified
              </p>
              <p className="mt-2 text-sm font-semibold">Resale inventory only</p>
            </div>
            <div className="surface-card p-4 shadow-none">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
                Secure
              </p>
              <p className="mt-2 text-sm font-semibold">Stripe-backed checkout</p>
            </div>
            <div className="surface-card p-4 shadow-none">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tertiary)]">
                Built for
              </p>
              <p className="mt-2 text-sm font-semibold">Concerts, sports, and live culture</p>
            </div>
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] editorial-gradient p-8 text-white shadow-[0_24px_50px_rgba(53,37,205,0.18)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_35%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="self-end rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur">
              Featured tonight
            </div>
            <div className="max-w-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-white/70">Curated highlight</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Midnight Echoes Live</h2>
              <p className="mt-4 text-sm leading-7 text-white/78">
                An editorial-style hero inspired by your Stitch concept, adapted to TicketSwap’s
                cleaner marketplace voice.
              </p>
            </div>
            <div className="surface-card max-w-xs rotate-[-3deg] bg-white/95 p-5 text-[var(--foreground)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                SafeExchange
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Every listing is verified before purchase and every checkout flow stays protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section surface-block px-6 py-12 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
              Featured now
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
              The season&apos;s best
            </h2>
          </div>
          <Link href="/events" className="text-sm font-semibold text-[var(--primary)] hover:opacity-80">
            View all
          </Link>
        </div>
        {error && (
          <p className="surface-card rounded-2xl bg-red-50 p-4 text-sm text-red-800">
            {error}
          </p>
        )}
        {!error && events.length === 0 && (
          <div className="surface-card empty-state">
            No events yet. An admin can create one from the admin panel.
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>

      <section className="editorial-section grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="surface-card p-8 md:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            Why TicketSwap
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">Trust is the foundation.</h2>
          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(53,37,205,0.1)] text-[var(--primary)]">
                ✓
              </div>
              <div>
                <h3 className="text-base font-bold">Verified listings</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Buyers can compare inventory quickly without second-guessing the listing quality.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(113,42,226,0.1)] text-[var(--secondary)]">
                $
              </div>
              <div>
                <h3 className="text-base font-bold">Fast seller flow</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  List extra seats in minutes with an admin-managed event catalog already in place.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(0,63,172,0.08)] text-[var(--tertiary)]">
                ⌁
              </div>
              <div>
                <h3 className="text-base font-bold">Editorial product feel</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Premium visuals and breathable layouts make the marketplace feel curated instead of
                  crowded.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="surface-card editorial-gradient flex min-h-[320px] flex-col justify-end overflow-hidden p-8 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            Next best move
          </p>
          <h2 className="mt-3 max-w-sm text-3xl font-bold tracking-[-0.03em]">
            Start browsing, then create your first listing when you&apos;re ready.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/events" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[var(--primary)]">
              Explore events
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl bg-white/12 px-5 py-3 text-sm font-bold text-white backdrop-blur"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
