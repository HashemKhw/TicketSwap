"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { deleteEvent, fetchEvents } from "@/lib/api";
import type { Event } from "@/lib/types";

export default function AdminEventsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    else if (!loading && user && user.role !== "ADMIN") router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetchEvents()
      .then((r) => setEvents(r.events))
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [user]);

  async function remove(id: string) {
    if (!confirm("Delete this event and all its listings?")) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading || !user || user.role !== "ADMIN") return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm font-semibold text-[var(--primary)] hover:underline">
            ← Admin
          </Link>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)]">Events</h1>
        </div>
        <Link
          href="/admin/events/new"
          className="cta-primary px-5 py-3 text-sm"
        >
          New event
        </Link>
      </div>
      {err && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
      <div className="surface-card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-[var(--surface-low)]">
            <tr>
              <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Title</th>
              <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Location</th>
              <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Date</th>
              <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-slate-100">
                <td className="px-5 py-4 font-semibold text-[var(--foreground)]">{e.title}</td>
                <td className="px-5 py-4 text-[var(--muted)]">{e.location}</td>
                <td className="px-5 py-4 text-[var(--muted)]">
                  {new Date(e.date).toLocaleString()}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/events/${e.id}/edit`}
                    className="mr-3 text-[var(--primary)] hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
