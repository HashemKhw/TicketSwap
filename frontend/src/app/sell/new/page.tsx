"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createListing, fetchEvents } from "@/lib/api";
import type { Event } from "@/lib/types";

export default function CreateListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [seatInfo, setSeatInfo] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    fetchEvents()
      .then((r) => setEvents(r.events))
      .catch(() => setEvents([]));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setPending(true);
    try {
      await createListing({
        eventId,
        price: Number(price),
        quantity: Number(quantity),
        seatInfo,
      });
      router.push("/dashboard/listings");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setPending(false);
    }
  }

  if (loading || !user) return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm font-semibold text-[var(--primary)] hover:underline">
        ← Dashboard
      </Link>
      <div className="mt-6">
        <span className="eyebrow">Sell tickets</span>
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
          Create listing
        </h1>
      </div>
      <form
        onSubmit={onSubmit}
        className="surface-card mt-8 space-y-5 p-8"
      >
        <div>
          <label className="field-label">Event</label>
          <select
            required
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="field-input"
          >
            <option value="">Select event</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Quantity</label>
          <input
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Seat / section info</label>
          <input
            required
            placeholder="e.g. Section 102, Row D"
            value={seatInfo}
            onChange={(e) => setSeatInfo(e.target.value)}
            className="field-input"
          />
        </div>
        {err && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
        <button
          type="submit"
          disabled={pending || events.length === 0}
          className="cta-primary w-full px-5 py-4 text-sm disabled:opacity-60"
        >
          {pending ? "Publishing…" : "Publish listing"}
        </button>
        {events.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            No events exist yet. An admin must create an event first.
          </p>
        )}
      </form>
    </div>
  );
}
