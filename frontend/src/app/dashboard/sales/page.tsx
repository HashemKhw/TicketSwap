"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchMySales, updateOrderFulfillment, uploadTicketPdf, uploadTransferProof } from "@/lib/api";
import { formatUsd, toNumber } from "@/lib/money";
import type { Order, UploadedAsset } from "@/lib/types";

export default function MySalesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [proofAssets, setProofAssets] = useState<Record<string, UploadedAsset | null>>({});
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchMySales()
      .then((r) => setOrders(r.orders))
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [user]);

  function replaceOrder(updated: Order) {
    setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
  }

  async function onPdfUpload(orderId: string, file: File | null) {
    if (!file) return;
    setErr(null);
    setPendingOrderId(orderId);
    try {
      const uploaded = await uploadTicketPdf(file);
      const response = await updateOrderFulfillment(orderId, {
        action: "upload_pdf",
        asset: { path: uploaded.asset.path, fileName: uploaded.asset.fileName },
        note: notes[orderId],
      });
      replaceOrder(response.order);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "PDF upload failed");
    } finally {
      setPendingOrderId(null);
    }
  }

  async function onTransferProofSelect(orderId: string, file: File | null) {
    if (!file) return;
    setErr(null);
    setPendingOrderId(orderId);
    try {
      const uploaded = await uploadTransferProof(file);
      setProofAssets((current) => ({ ...current, [orderId]: uploaded.asset }));
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Proof upload failed");
    } finally {
      setPendingOrderId(null);
    }
  }

  async function confirmTransfer(orderId: string) {
    setErr(null);
    setPendingOrderId(orderId);
    try {
      const proof = proofAssets[orderId];
      const response = await updateOrderFulfillment(orderId, {
        action: "confirm_mobile_transfer",
        asset: proof ? { path: proof.path, fileName: proof.fileName } : undefined,
        note: notes[orderId],
      });
      replaceOrder(response.order);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Transfer confirmation failed");
    } finally {
      setPendingOrderId(null);
    }
  }

  if (loading || !user) return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="page-shell space-y-8">
      <div>
        <span className="eyebrow">Seller revenue</span>
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
          My sales
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Completed purchases from buyers for your listings.
        </p>
      </div>
      {err && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="surface-card p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tertiary)]">
              Completed sale
            </p>
            <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
              {o.listing?.event?.title ?? "Event"} — {o.listing?.seatInfo}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Buyer: {o.buyerName ?? "Name pending"} · {o.buyer?.email} · Qty {o.quantity} ·{" "}
              {formatUsd(toNumber(o.totalPrice))}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {o.listing?.ticketType === "MOBILE_TRANSFER" ? "Mobile Transfer" : "PDF"} ·{" "}
              {o.fulfillmentStatus?.replaceAll("_", " ") ?? "PENDING"}
            </p>
            <p className="mt-2 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
            <div className="mt-5 space-y-4 rounded-[1.25rem] bg-[var(--surface-low)] p-4">
              <div>
                <label className="field-label">Seller note</label>
                <textarea
                  value={notes[o.id] ?? o.sellerDeliveryNote ?? ""}
                  onChange={(e) => setNotes((current) => ({ ...current, [o.id]: e.target.value }))}
                  className="field-input min-h-24"
                  placeholder="Optional message or transfer note"
                />
              </div>
              {o.listing?.ticketType === "PDF" ? (
                <div>
                  <label className="field-label">
                    {o.ticketPdfFileName ? "Replace ticket PDF" : "Attach ticket PDF"}
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => onPdfUpload(o.id, e.target.files?.[0] ?? null)}
                    className="field-input"
                    disabled={pendingOrderId === o.id}
                  />
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {pendingOrderId === o.id
                      ? "Uploading PDF..."
                      : o.ticketPdfFileName
                        ? `Current file: ${o.ticketPdfFileName}`
                        : "No PDF attached yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="field-label">Optional proof</label>
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                      onChange={(e) => onTransferProofSelect(o.id, e.target.files?.[0] ?? null)}
                      className="field-input"
                      disabled={pendingOrderId === o.id}
                    />
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {proofAssets[o.id]?.fileName ??
                        o.transferProofName ??
                        "Attach a screenshot or PDF only if you want proof on record."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => confirmTransfer(o.id)}
                    disabled={pendingOrderId === o.id || o.fulfillmentStatus === "TRANSFERRED"}
                    className="cta-primary px-5 py-3 text-sm disabled:opacity-60"
                  >
                    {o.fulfillmentStatus === "TRANSFERRED"
                      ? "Transfer confirmed"
                      : pendingOrderId === o.id
                        ? "Saving..."
                        : "Confirm transfer"}
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      {orders.length === 0 && !err && <div className="surface-card empty-state">No paid sales yet.</div>}
    </div>
  );
}
