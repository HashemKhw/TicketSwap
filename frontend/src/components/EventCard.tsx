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
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
    >
      <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
        {event.title}
      </h2>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{event.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>{event.location}</span>
        <span aria-hidden>·</span>
        <span>{formatDate(event.date)}</span>
      </div>
      <p className="mt-2 text-xs font-medium text-indigo-600">
        {count} listing{count === 1 ? "" : "s"} available
      </p>
    </Link>
  );
}
