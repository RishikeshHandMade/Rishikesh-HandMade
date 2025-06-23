import AboutUsSection from "@/components/AboutUsSection";
import GoToTop from "@/components/GoToTop";
import HeroSection from "@/components/HeroSection";
import RandomTourPackageSection from "@/components/RandomTourPackageSection";
import Boxes from "@/components/Boxes";
import InstaBlog from "@/components/InstaBlog";
import Banner from "@/components/Banner";
import ChatBot from "@/components/ChatBot";
import PopUpBanner from "@/components/PopUpBanner";

export default async function Home() {
  return (
    <>
      <PopUpBanner />
      <Boxes />
      <HeroSection />
      <AboutUsSection />
      <Banner />
      <RandomTourPackageSection />
      <InstaBlog />
      <GoToTop />
      <ChatBot/>
    </>
  );
}
