import Navbar from "@/components/Navbar";
import YatriAISection from "@/components/YatriAISection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Ask Yatri AI anything about Indian elections, voter registration, EVM, NOTA, Model Code of Conduct, and more. Powered by Google Gemini. Works in English and Hindi.",
};

export default function YatriAIPage() {
  return (
    <>
      <Navbar />
      {/* Full-height chat — no extra padding, no footer */}
      <main className="flex-1 pt-16">
        <YatriAISection />
      </main>
    </>
  );
}
