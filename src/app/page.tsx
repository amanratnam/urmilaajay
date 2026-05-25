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
  const heroPhotos = photos.slice(0, 10);
  const interstitial =
    photos.find((p) => p.subject === "urmila" && p.aspectRatio > 1) ??
    photos[0] ??
    null;

  return (
    <SmoothScrollProvider>
      <Nav />
      <main>
        <HeroSection photos={heroPhotos} />
        <IntroSection />
        <GalleryCarousel photos={photos} id="gallery" />
        {interstitial && <InterstitialSection photo={interstitial} />}
      </main>
      <FooterSection />
    </SmoothScrollProvider>
  );
}
