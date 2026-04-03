/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Event } from "@/lib/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function EventCard({ event }: { event: Event }) {
  const count = event._count?.listings ?? 0;
  return (
    <Link
      href={`/events/${event.id}`}
      className="surface-card group flex flex-col overflow-hidden p-0 transition duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-[1.5rem] editorial-gradient">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_38%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(25,28,30,0.6)] to-transparent" />
        <div className="absolute left-5 top-5">
          <span className="rounded-full bg-white/14 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
            Verified event
          </span>
        </div>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            {event.location}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">{event.title}</h2>
        </div>
      </div>
      <div className="p-6">
        <p className="line-clamp-3 text-sm leading-6 text-[var(--muted)]">{event.description}</p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
              Event date
            </p>
            <p className="text-sm font-semibold text-[var(--foreground)]">{formatDate(event.date)}</p>
          </div>
          <div className="rounded-full bg-[var(--surface-low)] px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Listings
            </p>
            <p className="text-sm font-bold text-[var(--primary)]">
              {count} available
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
