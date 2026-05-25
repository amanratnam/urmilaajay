import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Nav } from "@/components/layout/Nav";
import { HeroSection } from "@/components/layout/HeroSection";
import { IntroSection } from "@/components/layout/IntroSection";
import { GalleryCarousel } from "@/components/gallery/GalleryCarousel";
import { InterstitialSection } from "@/components/layout/InterstitialSection";
import { FooterSection } from "@/components/layout/FooterSection";
import { getPhotos } from "@/lib/photos";

export const revalidate = 3600;

export default async function Home() {
  const photos = await getPhotos();

  // Hero background: a single photo of Urmila only (subject === "urmila").
  // Controlled via admin sort order — the first "urmila" photo wins.
  const heroPhoto =
    photos.find((p) => p.subject === "urmila") ?? photos[0] ?? null;

  // Interstitial: a different urmila photo if possible, else any other.
  const interstitial =
    photos.find(
      (p) => p.subject === "urmila" && p.id !== heroPhoto?.id
    ) ??
    photos.find((p) => p.id !== heroPhoto?.id) ??
    heroPhoto ??
    null;

  return (
    <SmoothScrollProvider>
      <Nav />
      <main>
        <HeroSection photo={heroPhoto} />
        <IntroSection />
        <GalleryCarousel photos={photos} id="gallery" />
        {interstitial && <InterstitialSection photo={interstitial} />}
      </main>
      <FooterSection />
    </SmoothScrollProvider>
  );
}
