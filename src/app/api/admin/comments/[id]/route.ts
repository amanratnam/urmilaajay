import { NextRequest, NextResponse } from "next/server";

function checkAuth(req: NextRequest): boolean {
  const password = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected === "change-me") return false;
  return password === expected;
}

async function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || supabaseUrl.includes("placeholder")) return null;
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceKey);
}

// PATCH — approve a comment
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabase();
  if (!supabase) return NextResponse.json({ ok: true });

  const { error } = await supabase
    .from("comments")
    .update({ approved: true })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: "Failed to approve." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — reject (delete) a comment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabase();
  if (!supabase) return NextResponse.json({ ok: true });

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
