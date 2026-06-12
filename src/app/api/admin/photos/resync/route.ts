import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * POST — publish the current photo set to the public site.
 * Uploads no longer revalidate automatically; the cached photo list only
 * refreshes when the admin presses "Resync All Photos".
 */
export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected === "change-me" || password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("photos");
  revalidateTag("comments");
  // Purge every ISR'd page so the fresh photo list is picked up everywhere.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, syncedAt: new Date().toISOString() });
}
