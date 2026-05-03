import Navbar from "@/components/Navbar";
import MythBusterSection from "@/components/MythBusterSection";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Swipe through common election myths and facts — verified by ECI sources. Earn Jagruk Points and badges!",
};

export default function MythBusterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <MythBusterSection />
      </main>
      <Footer />
    </>
  );
}
