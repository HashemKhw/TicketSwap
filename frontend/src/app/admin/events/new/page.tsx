/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createEvent, uploadEventImage } from "@/lib/api";

export default function AdminNewEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    else if (!loading && user && user.role !== "ADMIN") router.replace("/");
  }, [user, loading, router]);

  async function onImageSelected(file: File | null) {
    if (!file) return;
    setErr(null);
    setUploadingImage(true);
    try {
      const response = await uploadEventImage(file);
      setImageUrl(response.asset.url ?? "");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setPending(true);
    try {
      const iso = new Date(date).toISOString();
      await createEvent({ title, description, location, date: iso, imageUrl: imageUrl || undefined });
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
          Create event
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
        <div>
          <label className="field-label">Event photo</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => onImageSelected(e.target.files?.[0] ?? null)}
            className="field-input"
          />
          <p className="mt-2 text-sm text-[var(--muted)]">
            {uploadingImage
              ? "Uploading image..."
              : imageUrl
                ? "Image uploaded and ready."
                : "Optional. Add a visual for event cards and detail pages."}
          </p>
          {imageUrl && (
            <img src={imageUrl} alt="Event preview" className="mt-3 h-40 w-full rounded-[1.25rem] object-cover" />
          )}
        </div>
        {err && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
        <button
          type="submit"
          disabled={pending}
          className="cta-primary w-full px-5 py-4 text-sm disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create event"}
        </button>
      </form>
    </div>
  );
}
