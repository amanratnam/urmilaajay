import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPhotoBySlug, getAdjacentPhotos } from "@/lib/photos";
import { PhotoDetail } from "@/components/photo/PhotoDetail";

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const photo = getPhotoBySlug(params.slug);
  if (!photo) return {};

  const subject =
    photo.subject === "both"
      ? "Urmila & Ajay"
      : photo.subject === "family"
      ? "Family"
      : photo.subject === "ajay"
      ? "Ajay"
      : "Urmila";

  const title = photo.caption
    ? `${photo.caption} — Urmila & Ajay`
    : `${subject}, ${photo.year} — Urmila & Ajay`;

  const ogTitle = photo.caption ? photo.caption : `${subject} · ${photo.year}`;
  const ogSub = "Remembered with love, always.";
  const ogUrl = `https://urmilaajay.com/og?title=${encodeURIComponent(ogTitle)}&sub=${encodeURIComponent(ogSub)}`;

  return {
    title,
    description: `A photograph from the archive of Urmila & Ajay.`,
    openGraph: {
      title,
      description: `A photograph from the archive of Urmila & Ajay.`,
      url: `https://urmilaajay.com/photo/${photo.slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [ogUrl],
    },
  };
}

export default function PhotoPage({ params }: Props) {
  const photo = getPhotoBySlug(params.slug);
  if (!photo) notFound();

  const { prev, next } = getAdjacentPhotos(params.slug);

  return <PhotoDetail photo={photo} prev={prev} next={next} />;
}
