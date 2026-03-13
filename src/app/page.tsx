import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FlightSearchBar } from "@/components/landing/FlightSearchBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PopularDestinations } from "@/components/landing/PopularDestinations";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FlightSearchBar />
        <HowItWorks />
        <PopularDestinations />
      </main>
      <Footer />
    </>
  );
}
