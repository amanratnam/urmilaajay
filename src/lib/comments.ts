import "server-only";
import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "./supabase/admin";

/**
 * Approved-memory counts keyed by photo_id. Cached and tagged "comments" so
 * moderation actions (approve / reject) can revalidate it.
 */
async function fetchApprovedCommentCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("comments")
    .select("photo_id")
    .eq("approved", true);

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data as { photo_id: string }[]) {
    counts[row.photo_id] = (counts[row.photo_id] ?? 0) + 1;
  }
  return counts;
}

export const getApprovedCommentCounts = unstable_cache(
  fetchApprovedCommentCounts,
  ["approved-comment-counts"],
  { revalidate: 3600, tags: ["comments"] }
);
