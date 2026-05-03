import Navbar from "@/components/Navbar";
import HomeContent from "@/components/HomeContent";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HomeContent />
      </main>
      <Footer />
    </>
  );
}
