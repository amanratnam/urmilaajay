import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, PHOTO_BUCKET } from "@/lib/supabase/admin";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

function checkAuth(req: NextRequest): boolean {
  const password = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected === "change-me") return false;
  return password === expected;
}

// PATCH — update caption / subject / year / sort_order
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.caption === "string") update.caption = body.caption.slice(0, 280);
  if (typeof body.subject === "string") update.subject = body.subject;
  if (typeof body.year === "number") update.year = body.year;
  if (typeof body.sort_order === "number") update.sort_order = body.sort_order;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await supabase.from("photos").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Update failed." }, { status: 500 });

  revalidateTag("photos");
  return NextResponse.json({ ok: true });
}

// DELETE — remove the row and the underlying object
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true });

  // Look up storage path first
  const { data: row } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("id", params.id)
    .maybeSingle();

  const { error } = await supabase.from("photos").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: "Delete failed." }, { status: 500 });

  if (row?.storage_path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([row.storage_path]);
  }

  revalidateTag("photos");
  return NextResponse.json({ ok: true });
}
