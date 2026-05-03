import Navbar from "@/components/Navbar";
import SimulatorSection from "@/components/SimulatorSection";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Experience a realistic EVM voting booth simulation, explore what-if election scenarios, and learn how Indian elections work.",
};

export default function SimulatorPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <SimulatorSection />
      </main>
      <Footer />
    </>
  );
}
