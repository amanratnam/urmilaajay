import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Nav } from "@/components/layout/Nav";
import { HeroSection } from "@/components/layout/HeroSection";
import { PinnedSection } from "@/components/layout/PinnedSection";
import { GallerySphere } from "@/components/gallery/GallerySphere";
import { FooterSection } from "@/components/layout/FooterSection";
import { Atmosphere } from "@/components/world/Atmosphere";
import { MomentDivider } from "@/components/world/Moments";
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
      {/* The living sky behind everything — sunrise to dusk as you scroll */}
      <Atmosphere />
      <Nav />
      <main style={{ position: "relative", zIndex: 1 }}>
        <HeroSection photos={photos} />
        <MomentDivider scene="walk" />
        <PinnedSection photo={pinnedPhoto} />
        <MomentDivider scene="tea" />
        <GallerySphere photos={photos} counts={counts} id="gallery" />
        <MomentDivider scene="stars" />
      </main>
      <FooterSection />
    </SmoothScrollProvider>
  );
}
