import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Service-role Supabase client. Server-only — never imported into a client
 * bundle (enforced by `server-only`). Bypasses RLS; used for storage writes,
 * signed-URL generation, and admin mutations.
 *
 * Returns null when credentials aren't configured (e.g. local placeholder),
 * so callers can degrade gracefully.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("placeholder") || key.includes("placeholder")) {
    return null;
  }
  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

export const PHOTO_BUCKET = "photos";
