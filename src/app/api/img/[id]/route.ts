import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, PHOTO_BUCKET } from "@/lib/supabase/admin";
import { getPhotoMetaById } from "@/lib/photos";

export const dynamic = "force-dynamic";

/**
 * Stable, never-expiring image URL: /api/img/<photo-id>.
 * Streams the object from the private Supabase bucket on demand, so pages
 * can embed this URL forever — no signed-token expiry, bucket stays private.
 * The Next image optimizer caches the optimized output, so this route is
 * only hit on optimizer cache misses.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return new NextResponse(null, { status: 404 });

  const meta = await getPhotoMetaById(id);
  if (!meta) return new NextResponse(null, { status: 404 });

  const { data: blob, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .download(meta.storagePath);

  if (error || !blob) return new NextResponse(null, { status: 502 });

  return new NextResponse(blob, {
    headers: {
      "Content-Type": blob.type || "image/jpeg",
      // A photo id always maps to the same object, so cache aggressively.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
