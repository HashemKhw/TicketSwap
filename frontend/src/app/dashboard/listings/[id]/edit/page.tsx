"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchMyListings, updateListing, uploadTicketPdf } from "@/lib/api";
import { formatSeatSummary, generateSeatSequence } from "@/lib/listings";
import { toNumber } from "@/lib/money";
import type { TicketType, UploadedAsset } from "@/lib/types";

export default function EditListingPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [seatSection, setSeatSection] = useState("");
  const [seatRow, setSeatRow] = useState("");
  const [seatFrom, setSeatFrom] = useState("");
  const [seatTo, setSeatTo] = useState("");
  const [seatsTogether, setSeatsTogether] = useState(false);
  const [seatInfo, setSeatInfo] = useState("");
  const [ticketType, setTicketType] = useState<TicketType>("PDF");
  const [pdfTiming, setPdfTiming] = useState<"now" | "after_sale">("after_sale");
  const [pdfAsset, setPdfAsset] = useState<UploadedAsset | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchMyListings()
      .then((r) => {
        const l = r.listings.find((x) => x.id === id);
        if (!l) {
          setErr("Listing not found");
          return;
        }
        setPrice(String(toNumber(l.price)));
        setQuantity(String(l.quantity));
        setSeatSection(l.seatSection ?? "");
        setSeatRow(l.seatRow ?? "");
        setSeatFrom(l.seatFrom != null ? String(l.seatFrom) : "");
        setSeatTo(l.seatTo != null ? String(l.seatTo) : "");
        setSeatsTogether(Boolean(l.seatsTogether));
        setSeatInfo(l.seatInfo);
        setTicketType(l.ticketType ?? "PDF");
        setPdfTiming(l.pdfFilePath ? "now" : "after_sale");
        setPdfAsset(
          l.pdfFilePath && l.pdfFileName
            ? {
                bucket: "ticket-pdfs",
                path: l.pdfFilePath,
                fileName: l.pdfFileName,
                url: null,
              }
            : null
        );
        setEventTitle(l.event?.title ?? "Event");
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [user, id]);

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
    if (ticketType === "PDF" && pdfTiming === "now" && !pdfAsset) {
      setErr("Upload the PDF now or switch to upload after sale.");
      return;
    }
    setPending(true);
    try {
      await updateListing(id, {
        price: Number(price),
        quantity: Number(quantity),
        seatInfo: seatsTogether ? undefined : seatInfo,
        seatSection,
        seatRow,
        seatFrom: seatFrom ? Number(seatFrom) : null,
        seatTo: seatTo ? Number(seatTo) : null,
        seatsTogether,
        ticketType,
        pdfAsset:
          ticketType === "PDF" && pdfTiming === "now"
            ? pdfAsset
              ? { path: pdfAsset.path, fileName: pdfAsset.fileName }
              : undefined
            : null,
        clearPdfAsset: ticketType === "MOBILE_TRANSFER" || pdfTiming === "after_sale",
      });
      router.push("/dashboard/listings");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Update failed");
    } finally {
      setPending(false);
    }
  }

  if (loading || !user) return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard/listings" className="text-sm font-semibold text-[var(--primary)] hover:underline">
        ← My listings
      </Link>
      <div className="mt-6">
        <span className="eyebrow">Update inventory</span>
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
          Edit listing
        </h1>
      </div>
      <form onSubmit={onSubmit} className="surface-card mt-8 space-y-5 p-8">
        <div className="rounded-[1.25rem] bg-[var(--surface-low)] px-4 py-4 text-sm text-[var(--muted)]">
          Editing listing for <span className="font-semibold text-[var(--foreground)]">{eventTitle}</span>.
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
                Attach before or after the sale.
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
                Confirm transfer after payment.
              </p>
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label">Quantity</label>
            <input
              type="number"
              min={0}
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
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Keep a default PDF attached to this listing.
                </p>
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
                  Ask the seller dashboard to handle the file later.
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
                      ? `Attached: ${pdfAsset.fileName}`
                      : "No default PDF attached."}
                </p>
              </div>
            )}
          </div>
        )}
        {ticketType === "MOBILE_TRANSFER" && (
          <div className="rounded-[1.25rem] bg-[var(--surface-low)] px-4 py-4 text-sm text-[var(--muted)]">
            Buyers will appear on the sales page with their name and email after payment, where you
            can confirm the transfer and optionally upload proof.
          </div>
        )}
        {err && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
        <button
          type="submit"
          disabled={pending}
          className="cta-primary w-full px-5 py-4 text-sm disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
