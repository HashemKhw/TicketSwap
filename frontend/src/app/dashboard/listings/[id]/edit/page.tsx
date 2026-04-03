"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchMyListings, updateListing } from "@/lib/api";
import { toNumber } from "@/lib/money";

export default function EditListingPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [seatInfo, setSeatInfo] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
        setSeatInfo(l.seatInfo);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [user, id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setPending(true);
    try {
      await updateListing(id, {
        price: Number(price),
        quantity: Number(quantity),
        seatInfo,
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
            min={0}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Seat info</label>
          <input
            required
            value={seatInfo}
            onChange={(e) => setSeatInfo(e.target.value)}
            className="field-input"
          />
        </div>
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
