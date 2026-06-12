import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, PHOTO_BUCKET } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

function checkAuth(req: NextRequest): boolean {
  const password = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected === "change-me") return false;
  return password === expected;
}

const SIGNED_TTL = 60 * 60; // 1h for admin previews

// GET — list all photos (admin view, includes signed preview URLs)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ photos: [] });

  const { data, error } = await supabase
    .from("photos")
    .select("id, storage_path, caption, subject, year, aspect_ratio, sort_order")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: "Failed to load." }, { status: 500 });

  const paths = (data ?? []).map((p) => p.storage_path);
  const { data: signed } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(paths, SIGNED_TTL);
  const urlByPath = new Map((signed ?? []).map((s) => [s.path ?? "", s.signedUrl]));

  const photos = (data ?? []).map((p) => ({
    ...p,
    src: urlByPath.get(p.storage_path) ?? "",
  }));
  return NextResponse.json({ photos });
}

// POST — upload a new photo (multipart form: file, caption?, subject?, year?)
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Storage not configured." }, { status: 500 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "Image exceeds 25 MB." }, { status: 400 });
  }

  const caption = (form.get("caption") as string | null)?.slice(0, 280) ?? "";
  const subject = (form.get("subject") as string | null) ?? "urmila";
  const yearRaw = form.get("year") as string | null;
  const year = yearRaw ? parseInt(yearRaw, 10) : null;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Dimensions + blur placeholder (sharp via plaiceholder)
  let aspectRatio = 1;
  let blurDataURL: string | null = null;
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(buffer).metadata();
    if (meta.width && meta.height) aspectRatio = meta.width / meta.height;
    const { getPlaiceholder } = await import("plaiceholder");
    const { base64 } = await getPlaiceholder(buffer, { size: 10 });
    blurDataURL = base64;
  } catch (err) {
    console.error("Image processing failed:", err);
  }

  // Unique storage key
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });
  if (upErr) {
    return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
  }

  // Next sort_order = max + 1
  const { data: maxRow } = await supabase
    .from("photos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { error: dbErr } = await supabase.from("photos").insert({
    storage_path: storagePath,
    caption,
    subject,
    year,
    aspect_ratio: aspectRatio,
    blur_data_url: blurDataURL,
    sort_order: sortOrder,
  });
  if (dbErr) {
    // Roll back the orphaned upload
    await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
    return NextResponse.json({ error: `Save failed: ${dbErr.message}` }, { status: 500 });
  }

  // Intentionally no revalidateTag here — new uploads stay admin-only until
  // "Resync All Photos" (POST /api/admin/photos/resync) publishes them.
  return NextResponse.json({ ok: true }, { status: 201 });
}
