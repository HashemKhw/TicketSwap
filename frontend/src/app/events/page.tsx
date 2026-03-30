"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { fetchEvents } from "@/lib/api";
import type { Event } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents()
      .then((r) =>
        setEvents(
          [...r.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        )
      )
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">All events</h1>
      <p className="mt-1 text-slate-600">Pick an event to see resale listings from fans.</p>
      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
