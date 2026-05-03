import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Platform: [
    { label: "My Journey", href: "/my-journey" },
    { label: "Simulator", href: "/simulator" },
    { label: "Myth Buster", href: "/myth-buster" },
    { label: "Quiz", href: "/quiz" },
    { label: "Yatri AI", href: "/yatri-ai" },
  ],
  Resources: [
    { label: "Voter Registration", href: "https://voters.eci.gov.in" },
    { label: "ECI Official Site", href: "https://eci.gov.in" },
    { label: "NVSP Portal", href: "https://www.nvsp.in" },
    { label: "Voter Helpline 1950", href: "tel:1950" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 dark:bg-background text-white transition-colors duration-300 border-t border-transparent dark:border-[#1e325c]">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <Image 
                src="/icon.svg" 
                alt="JagrukYatra Logo" 
                width={36} 
                height={36} 
                className="drop-shadow-md group-hover:scale-105 transition-transform" 
              />
              <span className="text-xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>
                <span className="text-[#FF6B00]">Jagruk</span>
                <span className="text-white">Yatra</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
              Empowering every Indian citizen with election knowledge, voter tools, and AI-powered
              guidance — one yatra at a time.
            </p>

            {/* Tricolour bar */}
            <div className="flex h-1.5 w-32 rounded-full overflow-hidden gap-0.5">
              <div className="flex-1 bg-[#FF6B00]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#1A2C6B]" />
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4" style={{ fontFamily: "var(--font-poppins)" }}>
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-[#FF6B00] text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} JagrukYatra · Made with <Heart className="inline w-3 h-3 text-red-400 mx-0.5" /> for Bharat
          </p>
          {/* Tasteful small credit — not prominent */}
          <p className="text-gray-700 text-xs">
            Built for PromptWars · Google for Developers
          </p>
        </div>
      </div>
    </footer>
  );
}
