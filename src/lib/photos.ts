import { Photo } from "@/types";

// Real photographs from /public/photos/
// Ordered: bright outdoor / warm-lit shots first, darker indoor shots later
// Aspect ratios from actual pixel dimensions (w/h)
export const photos: Photo[] = [
  // ── Bright outdoor & well-lit shots (lead the archive) ──────────────
  {
    id: "1",  slug: "photo-001",
    filename: "WP_20140811_18_33_15_Pro.jpg", src: "/photos/WP_20140811_18_33_15_Pro.jpg",
    caption: "", year: 2014, subject: "family", aspectRatio: 2592 / 1456,
  },
  {
    id: "2",  slug: "photo-002",
    filename: "WP_20140810_20_50_05_Pro.jpg", src: "/photos/WP_20140810_20_50_05_Pro.jpg",
    caption: "", year: 2014, subject: "both", aspectRatio: 2592 / 1456,
  },
  {
    id: "3",  slug: "photo-003",
    filename: "131120127021.jpg", src: "/photos/131120127021.jpg",
    caption: "", year: 2013, subject: "urmila", aspectRatio: 1200 / 1600,
  },
  {
    id: "4",  slug: "photo-004",
    filename: "131120127031.jpg", src: "/photos/131120127031.jpg",
    caption: "", year: 2013, subject: "urmila", aspectRatio: 1600 / 1200,
  },
  {
    id: "5",  slug: "photo-005",
    filename: "WP_20140811_18_33_18_Pro.jpg", src: "/photos/WP_20140811_18_33_18_Pro.jpg",
    caption: "", year: 2014, subject: "family", aspectRatio: 2592 / 1456,
  },
  {
    id: "6",  slug: "photo-006",
    filename: "WP_20140811_18_33_31_Pro.jpg", src: "/photos/WP_20140811_18_33_31_Pro.jpg",
    caption: "", year: 2014, subject: "family", aspectRatio: 2592 / 1456,
  },
  {
    id: "7",  slug: "photo-007",
    filename: "131120127032.jpg", src: "/photos/131120127032.jpg",
    caption: "", year: 2013, subject: "urmila", aspectRatio: 1200 / 1600,
  },
  {
    id: "8",  slug: "photo-008",
    filename: "131120127034.jpg", src: "/photos/131120127034.jpg",
    caption: "", year: 2013, subject: "urmila", aspectRatio: 1200 / 1600,
  },
  {
    id: "9",  slug: "photo-009",
    filename: "131120127038.jpg", src: "/photos/131120127038.jpg",
    caption: "", year: 2013, subject: "urmila", aspectRatio: 1200 / 1600,
  },
  {
    id: "10", slug: "photo-010",
    filename: "afterfocus_1361429856432.jpg", src: "/photos/afterfocus_1361429856432.jpg",
    caption: "", year: 2013, subject: "urmila", aspectRatio: 1600 / 1200,
  },
  {
    id: "11", slug: "photo-011",
    filename: "WP_20140811_14_58_44_Pro.jpg", src: "/photos/WP_20140811_14_58_44_Pro.jpg",
    caption: "", year: 2014, subject: "both", aspectRatio: 2592 / 1456,
  },
  {
    id: "12", slug: "photo-012",
    filename: "WP_20140811_14_59_01_Pro.jpg", src: "/photos/WP_20140811_14_59_01_Pro.jpg",
    caption: "", year: 2014, subject: "both", aspectRatio: 2592 / 1456,
  },
  {
    id: "13", slug: "photo-013",
    filename: "WP_20140811_14_59_04_Pro.jpg", src: "/photos/WP_20140811_14_59_04_Pro.jpg",
    caption: "", year: 2014, subject: "both", aspectRatio: 2592 / 1456,
  },
  {
    id: "14", slug: "photo-014",
    filename: "PicsPlay_1347035644743.jpg", src: "/photos/PicsPlay_1347035644743.jpg",
    caption: "", year: 2012, subject: "urmila", aspectRatio: 1200 / 1600,
  },
  {
    id: "15", slug: "photo-015",
    filename: "aahaaaannn.JPG", src: "/photos/aahaaaannn.JPG",
    caption: "", year: 2014, subject: "family", aspectRatio: 4320 / 3240,
  },
  {
    id: "16", slug: "photo-016",
    filename: "20141023_210017.jpg", src: "/photos/20141023_210017.jpg",
    caption: "", year: 2014, subject: "family", aspectRatio: 2560 / 1920,
  },
  // ── Mall / outing shots ────────────────────────────────────────────
  {
    id: "17", slug: "photo-017",
    filename: "WP_20140810_20_50_15_Pro.jpg", src: "/photos/WP_20140810_20_50_15_Pro.jpg",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1456 / 2592,
  },
  {
    id: "18", slug: "photo-018",
    filename: "WP_20140810_20_51_48_Pro.jpg", src: "/photos/WP_20140810_20_51_48_Pro.jpg",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1456 / 2592,
  },
  {
    id: "19", slug: "photo-019",
    filename: "WP_20140810_20_53_25_Pro.jpg", src: "/photos/WP_20140810_20_53_25_Pro.jpg",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1456 / 2592,
  },
  {
    id: "20", slug: "photo-020",
    filename: "WP_20140811_14_58_37_Pro.jpg", src: "/photos/WP_20140811_14_58_37_Pro.jpg",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1456 / 2592,
  },
  // ── WIN webcam shots ───────────────────────────────────────────────
  {
    id: "21", slug: "photo-021",
    filename: "WIN_20140424_233445.JPG", src: "/photos/WIN_20140424_233445.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1280 / 720,
  },
  {
    id: "22", slug: "photo-022",
    filename: "WIN_20140424_233448.JPG", src: "/photos/WIN_20140424_233448.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1280 / 720,
  },
  {
    id: "23", slug: "photo-023",
    filename: "WIN_20140424_233449.JPG", src: "/photos/WIN_20140424_233449.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1280 / 720,
  },
  {
    id: "24", slug: "photo-024",
    filename: "WIN_20140424_233451.JPG", src: "/photos/WIN_20140424_233451.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1280 / 720,
  },
  {
    id: "25", slug: "photo-025",
    filename: "WIN_20140424_233540.JPG", src: "/photos/WIN_20140424_233540.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1280 / 720,
  },
  {
    id: "26", slug: "photo-026",
    filename: "WIN_20140424_233546.JPG", src: "/photos/WIN_20140424_233546.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1280 / 720,
  },
  {
    id: "27", slug: "photo-027",
    filename: "WIN_20140424_233637.JPG", src: "/photos/WIN_20140424_233637.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1280 / 720,
  },
  {
    id: "28", slug: "photo-028",
    filename: "WIN_20140424_233714.JPG", src: "/photos/WIN_20140424_233714.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1280 / 720,
  },
  // ── Winter / later shots ───────────────────────────────────────────
  {
    id: "29", slug: "photo-029",
    filename: "WP_20141217_20_44_15_Pro.jpg", src: "/photos/WP_20141217_20_44_15_Pro.jpg",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 2592 / 1456,
  },
  {
    id: "30", slug: "photo-030",
    filename: "WP_20141217_20_46_14_Pro.jpg", src: "/photos/WP_20141217_20_46_14_Pro.jpg",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 2592 / 1456,
  },
  {
    id: "31", slug: "photo-031",
    filename: "WP_20141217_20_48_23_Pro.jpg", src: "/photos/WP_20141217_20_48_23_Pro.jpg",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1456 / 2592,
  },
  {
    id: "32", slug: "photo-032",
    filename: "WP_20150116_16_57_53_Pro.jpg", src: "/photos/WP_20150116_16_57_53_Pro.jpg",
    caption: "", year: 2015, subject: "urmila", aspectRatio: 1456 / 2592,
  },
  {
    id: "33", slug: "photo-033",
    filename: "WP_20150121_23_17_07_Pro.jpg", src: "/photos/WP_20150121_23_17_07_Pro.jpg",
    caption: "", year: 2015, subject: "urmila", aspectRatio: 1456 / 2592,
  },
  // ── DSCN outdoor shots ─────────────────────────────────────────────
  {
    id: "34", slug: "photo-034",
    filename: "DSCN4276.JPG", src: "/photos/DSCN4276.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 4320 / 3240,
  },
  {
    id: "35", slug: "photo-035",
    filename: "DSCN4280.JPG", src: "/photos/DSCN4280.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 4320 / 3240,
  },
  {
    id: "36", slug: "photo-036",
    filename: "DSCN4285.JPG", src: "/photos/DSCN4285.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 3240 / 4320,
  },
  {
    id: "37", slug: "photo-037",
    filename: "DSCN4291.JPG", src: "/photos/DSCN4291.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 4320 / 3240,
  },
  {
    id: "38", slug: "photo-038",
    filename: "DSCN4294.JPG", src: "/photos/DSCN4294.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 3240 / 4320,
  },
  {
    id: "39", slug: "photo-039",
    filename: "DSCN4298.JPG", src: "/photos/DSCN4298.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 3240 / 4320,
  },
  // ── Indoor formal / DSC shots ─────────────────────────────────────
  {
    id: "40", slug: "photo-040",
    filename: "DSC02534.JPG", src: "/photos/DSC02536.JPG",
    caption: "", year: 2014, subject: "both", aspectRatio: 3240 / 4320,
  },
  {
    id: "41", slug: "photo-041",
    filename: "DSC02535.JPG", src: "/photos/DSC02535.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 4320 / 3240,
  },
  {
    id: "42", slug: "photo-042",
    filename: "DSC02537.JPG", src: "/photos/DSC02537.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 3240 / 4320,
  },
  {
    id: "43", slug: "photo-043",
    filename: "DSC02538.JPG", src: "/photos/DSC02538.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 4320 / 3240,
  },
  {
    id: "44", slug: "photo-044",
    filename: "DSC02539.JPG", src: "/photos/DSC02539.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 4320 / 3240,
  },
  {
    id: "45", slug: "photo-045",
    filename: "DSC02540.JPG", src: "/photos/DSC02540.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 3240 / 4320,
  },
  {
    id: "46", slug: "photo-046",
    filename: "DSC02541.JPG", src: "/photos/DSC02541.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 4320 / 3240,
  },
  {
    id: "47", slug: "photo-047",
    filename: "DSC02542.JPG", src: "/photos/DSC02542.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 4320 / 3240,
  },
  {
    id: "48", slug: "photo-048",
    filename: "DSC02434.JPG", src: "/photos/DSC02434.JPG",
    caption: "", year: 2014, subject: "both", aspectRatio: 4608 / 3456,
  },
  {
    id: "49", slug: "photo-049",
    filename: "DSC02435.JPG", src: "/photos/DSC02435.JPG",
    caption: "", year: 2014, subject: "both", aspectRatio: 4608 / 3456,
  },
  // ── Misc ──────────────────────────────────────────────────────────
  {
    id: "50", slug: "photo-050",
    filename: "PicsArt_2014.jpg", src: "/photos/PicsArt_2014.jpg",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 506 / 761,
  },
  {
    id: "51", slug: "photo-051",
    filename: "InstagramCapture.jpg",
    src: "/photos/InstagramCapture_7b4f4231-3251-409e-813d-fc1b8c82d8ba.jpg",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 1,
  },
  {
    id: "52", slug: "photo-052",
    filename: "altAvY9.jpg",
    src: "/photos/altAvY9QEcpnCSXnh1b6gOweN-Z6Jyvs7QKBHaJo6CCJWId.jpg",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 480 / 640,
  },
  {
    id: "53", slug: "photo-053",
    filename: "DSC02679-small.JPG", src: "/photos/DSC02679-small.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 640 / 480,
  },
  {
    id: "54", slug: "photo-054",
    filename: "DSC02539-b.JPG", src: "/photos/DSC02539-b.JPG",
    caption: "", year: 2014, subject: "urmila", aspectRatio: 4320 / 3240,
  },
];

export const heroPhoto =
  photos.find((p) => p.subject === "both") ?? photos[0];

export const interstitialPhoto =
  photos.find(
    (p) => p.subject === "urmila" && p.aspectRatio > 1 && p.id !== heroPhoto.id
  ) ?? photos[1];

export function getPhotoBySlug(slug: string): Photo | undefined {
  return photos.find((p) => p.slug === slug);
}

export function getAdjacentPhotos(slug: string): {
  prev: Photo | null;
  next: Photo | null;
} {
  const idx = photos.findIndex((p) => p.slug === slug);
  return {
    prev: idx > 0 ? photos[idx - 1] : null,
    next: idx < photos.length - 1 ? photos[idx + 1] : null,
  };
}
