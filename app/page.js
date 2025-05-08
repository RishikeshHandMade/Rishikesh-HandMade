import AboutUsSection from "@/components/AboutUsSection";
import GoToTop from "@/components/GoToTop";
import HeroSection from "@/components/HeroSection";
import RandomTourPackageSection from "@/components/RandomTourPackageSection";

export default async function Home() {
  return (
    <>
      <HeroSection />
      <AboutUsSection />
      <RandomTourPackageSection />
      <GoToTop />
    </>
  );
}
