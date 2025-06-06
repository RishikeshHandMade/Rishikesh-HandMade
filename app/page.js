import AboutUsSection from "@/components/AboutUsSection";
import GoToTop from "@/components/GoToTop";
import HeroSection from "@/components/HeroSection";
import RandomTourPackageSection from "@/components/RandomTourPackageSection";
import Boxes from "@/components/Boxes";

export default async function Home() {
  return (
    <>
    <Boxes />
      <HeroSection />
      <AboutUsSection />
      <RandomTourPackageSection />
      <GoToTop />
    </>
  );
}
