import "server-only";
import { unstable_cache } from "next/cache";
import { getSupabaseAdmin, PHOTO_BUCKET } from "./supabase/admin";
import { Photo, PhotoSubject } from "@/types";

// Signed URLs live for 7 days; the data cache below revalidates hourly (or on
// admin mutation via revalidateTag("photos")), so URLs stay stable & valid
// within each cache window while never being publicly guessable.
const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

interface PhotoRow {
  id: string;
  storage_path: string;
  caption: string | null;
  subject: string | null;
  year: number | null;
  aspect_ratio: number | null;
  blur_data_url: string | null;
  sort_order: number | null;
}

async function fetchPhotos(): Promise<Photo[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("photos")
    .select("id, storage_path, caption, subject, year, aspect_ratio, blur_data_url, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return [];

  const rows = data as PhotoRow[];
  const paths = rows.map((r) => r.storage_path);

  const { data: signed } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL);

  const urlByPath = new Map(
    (signed ?? []).map((s) => [s.path ?? "", s.signedUrl])
  );

  return rows.map((r) => ({
    id: r.id,
    slug: r.id,
    storagePath: r.storage_path,
    src: urlByPath.get(r.storage_path) ?? "",
    caption: r.caption ?? "",
    year: r.year ?? 0,
    subject: (r.subject as PhotoSubject) ?? "urmila",
    aspectRatio: r.aspect_ratio ?? 1,
    sortOrder: r.sort_order ?? 0,
    blurDataURL: r.blur_data_url ?? undefined,
  }));
}

// Cached wrapper — stable signed URLs within the revalidation window.
export const getPhotos = unstable_cache(fetchPhotos, ["photos-list"], {
  revalidate: 3600,
  tags: ["photos"],
});

export async function getPhotoBySlug(slug: string): Promise<Photo | undefined> {
  const photos = await getPhotos();
  return photos.find((p) => p.slug === slug);
}

export async function getAdjacentPhotos(slug: string): Promise<{
  prev: Photo | null;
  next: Photo | null;
}> {
  const photos = await getPhotos();
  const idx = photos.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? photos[idx - 1] : null,
    next: idx < photos.length - 1 ? photos[idx + 1] : null,
  };
}

export async function getHeroPhotos(): Promise<Photo[]> {
  const photos = await getPhotos();
  return photos.slice(0, 10);
}
