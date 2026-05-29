import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Nav } from "@/components/layout/Nav";
import { HeroSection } from "@/components/layout/HeroSection";
import { PinnedSection } from "@/components/layout/PinnedSection";
import { GalleryCarousel } from "@/components/gallery/GalleryCarousel";
import { FooterSection } from "@/components/layout/FooterSection";
import { getPhotos } from "@/lib/photos";
import { getApprovedCommentCounts } from "@/lib/comments";

export const revalidate = 3600;

export default async function Home() {
  const [photos, counts] = await Promise.all([
    getPhotos(),
    getApprovedCommentCounts(),
  ]);

  // Photo for the pinned-parallax backdrop: prefer Urmila, fall back to any.
  const pinnedPhoto =
    photos.find((p) => p.subject === "urmila") ?? photos[0] ?? null;

  return (
    <SmoothScrollProvider>
      <Nav />
      <main>
        <HeroSection photos={photos} />
        <PinnedSection photo={pinnedPhoto} />
        <GalleryCarousel photos={photos} counts={counts} id="gallery" />
      </main>
      <FooterSection />
    </SmoothScrollProvider>
  );
}
