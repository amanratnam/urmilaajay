"use client";
import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (anon key). Safe to import in client components.
 * Only used for reading approved comments; all writes go through API routes.
 */
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key"
);
