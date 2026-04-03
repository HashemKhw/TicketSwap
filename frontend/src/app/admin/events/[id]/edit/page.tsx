"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchEvent, updateEvent } from "@/lib/api";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminEditEventPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    else if (!loading && user && user.role !== "ADMIN") router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetchEvent(id)
      .then((r) => {
        const e = r.event;
        setTitle(e.title);
        setDescription(e.description);
        setLocation(e.location);
        setDate(toLocalInput(e.date));
      })
      .catch((ex) => setErr(ex instanceof Error ? ex.message : "Not found"));
  }, [user, id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setPending(true);
    try {
      const iso = new Date(date).toISOString();
      await updateEvent(id, { title, description, location, date: iso });
      router.push("/admin/events");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setPending(false);
    }
  }

  if (loading || !user || user.role !== "ADMIN") return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/events" className="text-sm font-semibold text-[var(--primary)] hover:underline">
        ← Events
      </Link>
      <div className="mt-6">
        <span className="eyebrow">Admin publishing</span>
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)]">
          Edit event
        </h1>
      </div>
      <form
        onSubmit={onSubmit}
        className="surface-card mt-8 space-y-5 p-8"
      >
        <div>
          <label className="field-label">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Location</label>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Date & time</label>
          <input
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
