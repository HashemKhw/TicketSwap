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
    <div className="mx-auto max-w-lg">
      <Link href="/dashboard/listings" className="text-sm font-medium text-indigo-600 hover:underline">
        ← My listings
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Edit listing</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700">Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Quantity</label>
          <input
            type="number"
            min={0}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Seat info</label>
          <input
            required
            value={seatInfo}
            onChange={(e) => setSeatInfo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
