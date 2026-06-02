import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function checkAuth(req: NextRequest): boolean {
  const password = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected === "change-me") return false;
  return password === expected;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: true });

  const { error } = await supabase.from("letters").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
