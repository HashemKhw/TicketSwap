"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { fetchEvents } from "@/lib/api";
import type { Event } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEvents()
      .then((r) =>
        setEvents(
          [...r.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        )
      )
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [event.title, event.location, event.description].some((value) =>
      value.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page-shell">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <span className="eyebrow">Curated selection</span>
          <h1 className="page-heading mt-5 max-w-4xl">
            Find your next <span className="text-[var(--primary)]">iconic moment.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)]">
            Explore live events across music, sports, and culture. Compare real resale availability
            and move straight into the buying flow.
          </p>
        </div>
        <div className="surface-card p-6 md:p-7">
          <label htmlFor="search" className="field-label">
            Search events
          </label>
          <input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, venue, or city"
            className="field-input"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="info-chip">All categories</span>
            <span className="info-chip">Any date</span>
            <span className="info-chip">Resale only</span>
          </div>
        </div>
      </section>
      {error && (
        <p className="surface-card mt-8 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
          {error}
        </p>
      )}
      {!error && filteredEvents.length === 0 && (
        <div className="surface-card empty-state mt-8">
          No events matched your search. Try another city, title, or venue keyword.
        </div>
      )}
      <div className="editorial-section grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
