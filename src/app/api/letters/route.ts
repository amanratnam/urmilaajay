import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// In-memory IP-keyed rate limit. Personal letters are heavier than comments,
// so the window is tighter.
const RATE_LIMIT_WINDOW = 5 * 60_000; // 5 minutes
const RATE_LIMIT_MAX = 2;             // at most 2 letters per IP per window
const ipTimestamps = new Map<string, number[]>();

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowed = (ipTimestamps.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW);
  windowed.push(now);
  ipTimestamps.set(ip, windowed);
  return windowed.length > RATE_LIMIT_MAX;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // Per-IP rate limit (defence against abuse / casual DoS at the app layer)
  if (isRateLimited(getIp(req))) {
    return NextResponse.json(
      { error: "Too many letters. Please wait a few minutes." },
      { status: 429 }
    );
  }

  // Hard cap the payload so a huge JSON body can't waste server time
  const lengthHeader = req.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > 8_000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, body } = payload as Record<string, unknown>;
  if (typeof name !== "string" || typeof email !== "string" || typeof body !== "string") {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  // Name is optional — visitors may choose to remain anonymous.
  const trimmedName = name.trim().slice(0, 80) || "Anonymous";
  const trimmedEmail = email.trim().slice(0, 140);
  const trimmedBody = body.trim();

  if (!trimmedEmail || !trimmedBody) {
    return NextResponse.json({ error: "Email and memory are required." }, { status: 400 });
  }
  if (trimmedBody.length > 1000) {
    return NextResponse.json({ error: "Please keep the letter under 1000 characters." }, { status: 400 });
  }
  if (!EMAIL_RE.test(trimmedEmail)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  // Stored as plain text — letters are rendered text-only in the admin view,
  // never as HTML, which removes the XSS vector. SQL injection is blocked by
  // Supabase's parameterised insert (no string concatenation).
  if (supabase) {
    const { error } = await supabase.from("letters").insert({
      author_name: trimmedName,
      author_email: trimmedEmail,
      body: trimmedBody,
    });
    if (error) {
      console.error("Letter insert failed:", error);
      return NextResponse.json({ error: "Could not save the letter. Please try again." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
