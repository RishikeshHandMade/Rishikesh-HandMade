import AboutUsSection from "@/components/AboutUsSection";
import GoToTop from "@/components/GoToTop";
import HeroSection from "@/components/HeroSection";
import RandomTourPackageSection from "@/components/RandomTourPackageSection";
import Boxes from "@/components/Boxes";
import InstaBlog from "@/components/InstaBlog";
import Banner from "@/components/Banner";

export default async function Home() {
  return (
    <>
      <Boxes />
      <HeroSection />
      <AboutUsSection />
      <Banner />
      <RandomTourPackageSection />
      <InstaBlog />
      <GoToTop />
    </>
  );
}
