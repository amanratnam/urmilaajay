import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Nav } from "@/components/layout/Nav";
import { HeroSection } from "@/components/layout/HeroSection";
import { IntroSection } from "@/components/layout/IntroSection";
import { ArchiveGrid } from "@/components/grid/ArchiveGrid";
import { InterstitialSection } from "@/components/layout/InterstitialSection";
import { FooterSection } from "@/components/layout/FooterSection";
import { photos } from "@/lib/photos";

const firstHalf = photos.slice(0, 28);
const secondHalf = photos.slice(28);

export default function Home() {
  return (
    <SmoothScrollProvider>
      <Nav />
      <main>
        <HeroSection />
        <IntroSection />
        <ArchiveGrid photos={firstHalf} id="archive" />
        <InterstitialSection />
        <ArchiveGrid photos={secondHalf} />
      </main>
      <FooterSection />
    </SmoothScrollProvider>
  );
}
