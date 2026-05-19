import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3;
const ipTimestamps = new Map<string, number[]>();

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipTimestamps.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW);
  timestamps.push(now);
  ipTimestamps.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { photo_id, author_name, body: commentBody } = body as Record<string, unknown>;

  if (
    typeof photo_id !== "string" ||
    typeof author_name !== "string" ||
    typeof commentBody !== "string"
  ) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  if (!author_name.trim() || !commentBody.trim()) {
    return NextResponse.json({ error: "Name and memory are required." }, { status: 400 });
  }

  if (commentBody.length > 1000) {
    return NextResponse.json({ error: "Memory too long." }, { status: 400 });
  }

  // Supabase integration — gracefully no-ops if env vars aren't configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    supabaseUrl &&
    serviceKey &&
    !supabaseUrl.includes("placeholder") &&
    !serviceKey.includes("placeholder")
  ) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey);
    const { error } = await supabase.from("comments").insert({
      photo_id,
      author_name: author_name.trim().slice(0, 80),
      body: commentBody.trim(),
      approved: false,
    });
    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
