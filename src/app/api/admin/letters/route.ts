import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function checkAuth(req: NextRequest): boolean {
  const password = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected === "change-me") return false;
  return password === expected;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ letters: [] });

  const { data, error } = await supabase
    .from("letters")
    .select("id, author_name, author_email, body, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load letters." }, { status: 500 });
  }
  return NextResponse.json({ letters: data ?? [] });
}
