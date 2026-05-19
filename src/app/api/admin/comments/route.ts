import { NextRequest, NextResponse } from "next/server";

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes("placeholder")) {
    return NextResponse.json({ comments: [] });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase
    .from("comments")
    .select("id, photo_id, author_name, body, created_at, approved")
    .eq("approved", false)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch comments." }, { status: 500 });
  }

  return NextResponse.json({ comments: data ?? [] });
}
