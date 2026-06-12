import "server-only";
import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "./supabase/admin";
import { Photo, PhotoSubject } from "@/types";

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

  return (data as PhotoRow[]).map((r) => ({
    id: r.id,
    slug: r.id,
    storagePath: r.storage_path,
    // Stable internal URL — /api/img/[id] redirects to a freshly signed
    // Supabase URL on demand, so cached pages never hold expired tokens.
    src: `/api/img/${r.id}`,
    caption: r.caption ?? "",
    year: r.year ?? 0,
    subject: (r.subject as PhotoSubject) ?? "urmila",
    aspectRatio: r.aspect_ratio ?? 1,
    sortOrder: r.sort_order ?? 0,
    blurDataURL: r.blur_data_url ?? undefined,
  }));
}

// revalidate: false — the public photo list only refreshes when the admin
// presses "Resync All Photos" (or edits/deletes, which revalidate the tag).
export const getPhotos = unstable_cache(fetchPhotos, ["photos-list"], {
  revalidate: false,
  tags: ["photos"],
});

/** Storage-path lookup for the /api/img redirect route (cached via getPhotos). */
export async function getPhotoMetaById(
  id: string
): Promise<{ storagePath: string } | null> {
  const photos = await getPhotos();
  const photo = photos.find((p) => p.id === id);
  return photo ? { storagePath: photo.storagePath } : null;
}

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
