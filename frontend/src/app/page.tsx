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
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-12 text-white shadow-lg sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Find tickets. Sell seats you can&apos;t use.
        </h1>
        <p className="mt-3 max-w-xl text-indigo-100">
          Browse live events, compare resale listings, and checkout securely with Stripe (test
          mode).
        </p>
        <Link
          href="/events"
          className="mt-6 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-50"
        >
          Browse all events
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Featured events</h2>
          <Link href="/events" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </p>
        )}
        {!error && events.length === 0 && (
          <p className="text-slate-600">No events yet. An admin can create one from the admin panel.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </div>
  );
}
