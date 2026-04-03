import { randomUUID } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type UploadBucket = "event-images" | "ticket-pdfs" | "transfer-proofs";

const MIME_BY_BUCKET: Record<UploadBucket, string[]> = {
  "event-images": ["image/jpeg", "image/png", "image/webp"],
  "ticket-pdfs": ["application/pdf"],
  "transfer-proofs": ["application/pdf", "image/jpeg", "image/png", "image/webp"],
};

const PUBLIC_BUCKETS = new Set<UploadBucket>(["event-images"]);

let supabaseAdmin: SupabaseClient | null = null;

function inferSupabaseUrlFromDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;
  const match = databaseUrl.match(/db\.([a-z0-9]+)\.supabase\.co/i);
  if (!match) return null;
  return `https://${match[1]}.supabase.co`;
}

function getSupabaseUrl() {
  return process.env.SUPABASE_URL ?? inferSupabaseUrlFromDatabaseUrl();
}

function ensureStorageConfig() {
  const url = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return { url, serviceRoleKey };
}

export function getSupabaseAdminClient() {
  if (supabaseAdmin) return supabaseAdmin;
  const { url, serviceRoleKey } = ensureStorageConfig();
  supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabaseAdmin;
}

function extensionFromMimeType(mimeType: string) {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export function assertAllowedMimeType(bucket: UploadBucket, mimeType: string) {
  if (!MIME_BY_BUCKET[bucket].includes(mimeType)) {
    throw new Error(`Unsupported file type for ${bucket}`);
  }
}

export async function ensureStorageBuckets() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    for (const bucket of Object.keys(MIME_BY_BUCKET) as UploadBucket[]) {
      if (buckets?.some((item) => item.name === bucket)) continue;

      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: PUBLIC_BUCKETS.has(bucket),
        fileSizeLimit: bucket === "event-images" ? 5 * 1024 * 1024 : 10 * 1024 * 1024,
        allowedMimeTypes: MIME_BY_BUCKET[bucket],
      });
      if (createError) throw createError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown storage setup error";
    console.warn(`Storage buckets not initialized: ${message}`);
  }
}

export async function uploadBufferToBucket(params: {
  bucket: UploadBucket;
  buffer: Buffer;
  mimeType: string;
  fileName?: string | null;
  ownerId: string;
}) {
  const { bucket, buffer, mimeType, fileName, ownerId } = params;
  assertAllowedMimeType(bucket, mimeType);

  const supabase = getSupabaseAdminClient();
  const extension = extensionFromMimeType(mimeType);
  const objectPath = `${ownerId}/${randomUUID()}.${extension}`;
  const upload = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (upload.error) throw upload.error;

  const resolvedFileName = fileName?.trim() || objectPath.split("/").pop() || `upload.${extension}`;
  const publicUrl = PUBLIC_BUCKETS.has(bucket)
    ? supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl
    : null;

  return {
    bucket,
    path: objectPath,
    fileName: resolvedFileName,
    url: publicUrl,
  };
}
