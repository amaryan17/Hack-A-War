import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { HeroSection } from "@/components/ui/hero-odyssey";
import { HeroSection3 } from "@/components/ui/hero-section-3";
import { HeroSection as GalaxyHero } from "@/components/ui/galaxy-interactive-hero-section";

export function DemoHeroGeometric() {
    return (
        <HeroGeometric 
            badge="Kokonut UI"
            title1="Elevate Your"
            title2="Digital Vision" 
        />
    )
}

const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <HeroSection />
    </div>
  );
};

export const DemoTwo = () => {
  return (
      <HeroSection3 />
  );
}

export function DemoThree() {
  return (
    <main className="bg-black relative h-screen w-screen">
      <GalaxyHero />
    </main>
  );
}

export { DemoOne };
