/**
 * One-time migration: upload existing public/photos/ images into the private
 * Supabase `photos` bucket and seed the `photos` metadata table.
 *
 * Prereqs:
 *   1. Run supabase/schema.sql in the Supabase SQL editor (creates tables).
 *   2. .env.local has NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:  npx tsx scripts/migrate-to-supabase.ts
 *
 * Idempotent: re-running upserts by storage_path and skips existing uploads.
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "photos";
const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const LEGACY = path.join(process.cwd(), "scripts", "legacy-photos.json");

if (!URL || !KEY || URL.includes("placeholder")) {
  console.error("✗  Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

interface Legacy {
  filename: string;
  src: string;
  caption: string;
  year: number;
  subject: string;
  aspectRatio: number;
  blurDataURL?: string;
}

const contentType = (file: string) => {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
};

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) {
    console.log(`✓  Bucket "${BUCKET}" already exists`);
    return;
  }
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 26214400, // 25 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (error) throw error;
  console.log(`✓  Created private bucket "${BUCKET}"`);
}

async function main() {
  await ensureBucket();

  const legacy: Legacy[] = JSON.parse(fs.readFileSync(LEGACY, "utf-8"));
  console.log(`\nMigrating ${legacy.length} photos…\n`);

  for (let i = 0; i < legacy.length; i++) {
    const p = legacy[i];
    // src looks like "/photos/FILE.jpg" — derive the actual file on disk
    const diskName = p.src.replace(/^\/photos\//, "");
    const diskPath = path.join(PHOTOS_DIR, diskName);
    const storagePath = diskName; // keep original filename as the object key

    process.stdout.write(`  [${i + 1}/${legacy.length}] ${storagePath} … `);

    if (!fs.existsSync(diskPath)) {
      console.log("✗ file missing, skipped");
      continue;
    }

    // Upload (upsert) the bytes
    const bytes = fs.readFileSync(diskPath);
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, {
        contentType: contentType(diskName),
        upsert: true,
      });
    if (upErr) {
      console.log(`✗ upload failed: ${upErr.message}`);
      continue;
    }

    // Upsert the metadata row (unique on storage_path)
    const { error: dbErr } = await supabase
      .from("photos")
      .upsert(
        {
          storage_path: storagePath,
          caption: p.caption ?? "",
          subject: p.subject ?? "urmila",
          year: p.year ?? null,
          aspect_ratio: p.aspectRatio ?? 1,
          blur_data_url: p.blurDataURL ?? null,
          sort_order: i,
        },
        { onConflict: "storage_path" }
      );
    if (dbErr) {
      console.log(`✗ db failed: ${dbErr.message}`);
      continue;
    }

    console.log("✓");
  }

  const { count } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true });
  console.log(`\n✅  Done. photos table now has ${count} rows.`);
}

main().catch((err) => {
  console.error("\n✗  Migration failed:", err);
  process.exit(1);
});
