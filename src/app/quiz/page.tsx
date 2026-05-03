import Navbar from "@/components/Navbar";
import QuizSection from "@/components/QuizSection";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Test your democratic knowledge with 10 timed questions across 4 categories. Earn points and unlock the Quiz Master badge!",
};

export default function QuizPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <QuizSection />
      </main>
      <Footer />
    </>
  );
}
