/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createListing, fetchEvents, uploadTicketPdf } from "@/lib/api";
import { formatSeatSummary, generateSeatSequence } from "@/lib/listings";
import type { Event, TicketType, UploadedAsset } from "@/lib/types";

export default function CreateListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState("");
  const [eventQuery, setEventQuery] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [seatSection, setSeatSection] = useState("");
  const [seatRow, setSeatRow] = useState("");
  const [seatFrom, setSeatFrom] = useState("");
  const [seatTo, setSeatTo] = useState("");
  const [seatsTogether, setSeatsTogether] = useState(true);
  const [seatInfo, setSeatInfo] = useState("");
  const [ticketType, setTicketType] = useState<TicketType>("PDF");
  const [pdfTiming, setPdfTiming] = useState<"now" | "after_sale">("after_sale");
  const [pdfAsset, setPdfAsset] = useState<UploadedAsset | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    fetchEvents()
      .then((r) => setEvents(r.events))
      .catch(() => setEvents([]));
  }, []);

  const filteredEvents = events.filter((event) => {
    const query = eventQuery.trim().toLowerCase();
    if (!query) return true;
    return [event.title, event.location].some((value) => value.toLowerCase().includes(query));
  });

  const selectedEvent = events.find((event) => event.id === eventId);
  const numericQuantity = Number(quantity) || 0;
  const seatPreview = formatSeatSummary({
    seatSection,
    seatRow,
    seatFrom: seatFrom ? Number(seatFrom) : undefined,
    seatTo: seatTo ? Number(seatTo) : undefined,
    seatsTogether,
    seatInfo,
    quantity: numericQuantity,
  });

  async function onPdfSelected(file: File | null) {
    if (!file) return;
    setErr(null);
    setUploadingPdf(true);
    try {
      const response = await uploadTicketPdf(file);
      setPdfAsset(response.asset);
      setPdfTiming("now");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "PDF upload failed");
    } finally {
      setUploadingPdf(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!eventId) {
      setErr("Please choose an event.");
      return;
    }
    if (ticketType === "PDF" && pdfTiming === "now" && !pdfAsset) {
      setErr("Upload the PDF now or switch to upload after sale.");
      return;
    }
    setPending(true);
    try {
      await createListing({
        eventId,
        price: Number(price),
        quantity: Number(quantity),
        seatInfo: seatsTogether ? undefined : seatInfo,
        seatSection: seatSection || undefined,
        seatRow: seatRow || undefined,
        seatFrom: seatFrom ? Number(seatFrom) : undefined,
        seatTo: seatTo ? Number(seatTo) : undefined,
        seatsTogether,
        ticketType,
        pdfAsset: ticketType === "PDF" && pdfTiming === "now" ? pdfAsset ?? undefined : undefined,
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
          <label className="field-label">Find event</label>
          <input
            value={eventQuery}
            onChange={(e) => setEventQuery(e.target.value)}
            placeholder="Search by title or location"
            className="field-input"
          />
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-[1.25rem] bg-[var(--surface-low)] p-3">
            {filteredEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setEventId(event.id)}
                className={`flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-left transition ${
                  event.id === eventId
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/70"
                }`}
              >
                <div className="h-14 w-14 overflow-hidden rounded-[1rem] bg-[var(--surface-high)]">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{event.title}</p>
                  <p className="text-sm text-[var(--muted)]">{event.location}</p>
                </div>
              </button>
            ))}
            {filteredEvents.length === 0 && (
              <p className="px-3 py-4 text-sm text-slate-500">No matching events found.</p>
            )}
          </div>
          {selectedEvent && (
            <p className="mt-3 text-sm font-medium text-[var(--primary)]">
              Selected: {selectedEvent.title}
            </p>
          )}
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
          <label className="field-label">Ticket type</label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTicketType("PDF")}
              className={`rounded-[1.25rem] px-4 py-4 text-left ${
                ticketType === "PDF" ? "editorial-gradient text-white" : "bg-[var(--surface-low)]"
              }`}
            >
              <p className="font-semibold">PDF</p>
              <p className={`mt-1 text-sm ${ticketType === "PDF" ? "text-white/80" : "text-[var(--muted)]"}`}>
                Upload now or after the sale.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setTicketType("MOBILE_TRANSFER")}
              className={`rounded-[1.25rem] px-4 py-4 text-left ${
                ticketType === "MOBILE_TRANSFER"
                  ? "editorial-gradient text-white"
                  : "bg-[var(--surface-low)]"
              }`}
            >
              <p className="font-semibold">Mobile Transfer</p>
              <p
                className={`mt-1 text-sm ${
                  ticketType === "MOBILE_TRANSFER" ? "text-white/80" : "text-[var(--muted)]"
                }`}
              >
                Confirm transfer after the buyer pays.
              </p>
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
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
            <label className="field-label">Section</label>
            <input value={seatSection} onChange={(e) => setSeatSection(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="field-label">Row</label>
            <input value={seatRow} onChange={(e) => setSeatRow(e.target.value)} className="field-input" />
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-[var(--surface-low)] p-5">
          <label className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={seatsTogether}
              onChange={(e) => setSeatsTogether(e.target.checked)}
            />
            Tickets are allocated next to each other
          </label>
          {seatsTogether ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">First seat</label>
                <input
                  type="number"
                  min={1}
                  value={seatFrom}
                  onChange={(e) => setSeatFrom(e.target.value)}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Last seat</label>
                <input
                  type="number"
                  min={1}
                  value={seatTo}
                  onChange={(e) => setSeatTo(e.target.value)}
                  className="field-input"
                />
              </div>
              <div className="sm:col-span-2 rounded-[1rem] bg-white px-4 py-4 text-sm text-[var(--muted)]">
                <p className="font-semibold text-[var(--foreground)]">Auto generated preview</p>
                <p className="mt-2">{seatPreview || "Enter the seat range to preview the listing summary."}</p>
                {generateSeatSequence(seatFrom ? Number(seatFrom) : undefined, seatTo ? Number(seatTo) : undefined)
                  .length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    Seats:{" "}
                    {generateSeatSequence(
                      seatFrom ? Number(seatFrom) : undefined,
                      seatTo ? Number(seatTo) : undefined
                    ).join(", ")}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <label className="field-label">Seat details</label>
              <textarea
                required={!seatsTogether}
                placeholder="Example: Seats 12, 14, and 18 in the same row"
                value={seatInfo}
                onChange={(e) => setSeatInfo(e.target.value)}
                className="field-input min-h-28"
              />
            </div>
          )}
        </div>
        {ticketType === "PDF" && (
          <div className="rounded-[1.5rem] bg-[var(--surface-low)] p-5">
            <label className="field-label">PDF delivery timing</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPdfTiming("now")}
                className={`rounded-[1rem] px-4 py-4 text-left ${
                  pdfTiming === "now" ? "bg-white shadow-sm" : "bg-transparent"
                }`}
              >
                <p className="font-semibold text-[var(--foreground)]">Attach now</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Upload the PDF before the sale.</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPdfTiming("after_sale");
                  setPdfAsset(null);
                }}
                className={`rounded-[1rem] px-4 py-4 text-left ${
                  pdfTiming === "after_sale" ? "bg-white shadow-sm" : "bg-transparent"
                }`}
              >
                <p className="font-semibold text-[var(--foreground)]">Upload after sale</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Add the PDF later from your sales dashboard.
                </p>
              </button>
            </div>
            {pdfTiming === "now" && (
              <div className="mt-4">
                <label className="field-label">Ticket PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => onPdfSelected(e.target.files?.[0] ?? null)}
                  className="field-input"
                />
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {uploadingPdf
                    ? "Uploading PDF..."
                    : pdfAsset
                      ? `Uploaded: ${pdfAsset.fileName}`
                      : "No PDF uploaded yet."}
                </p>
              </div>
            )}
          </div>
        )}
        {ticketType === "MOBILE_TRANSFER" && (
          <div className="rounded-[1.25rem] bg-[var(--surface-low)] px-4 py-4 text-sm text-[var(--muted)]">
            After the buyer pays, you’ll see their name and email on the sales page where you can
            confirm the transfer and optionally attach proof.
          </div>
        )}
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
