import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight password check used by the admin layout to verify a stored
 * sessionStorage password on mount. Returns 200 OK if correct, 401 if not.
 */
export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected === "change-me") {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
