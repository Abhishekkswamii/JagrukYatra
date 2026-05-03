import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import FloatingYatriAI from "@/components/FloatingYatriAI";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  preload: false,
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Georgia", "system-ui", "sans-serif"],
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6B00" },
    { media: "(prefers-color-scheme: dark)", color: "#1A2C6B" },
  ],
};

export const metadata: Metadata = {
  title: "JagrukYatra — Your Personal Election Awareness Journey",
  description:
    "JagrukYatra empowers every Indian citizen with election knowledge, voter tools, myth-busting facts, an election simulator, and AI-powered guidance — Yatri AI.",
  keywords: [
    "election awareness",
    "voter education",
    "India elections",
    "democracy",
    "JagrukYatra",
    "voter registration",
    "ECI",
    "Election Commission",
    "PromptWars",
    "Google for Developers",
    "EVM simulator",
    "NOTA",
    "first time voter",
  ],
  authors: [{ name: "Abhishek Swami" }],
  creator: "Abhishek Swami",
  metadataBase: new URL("https://jagrukyatra.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "JagrukYatra",
    title: "JagrukYatra — Your Personal Election Awareness Journey",
    description:
      "Interactive election education platform with AI guide, EVM simulator, myth buster arena, and voter knowledge quiz.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JagrukYatra — Election Awareness Journey 🇮🇳",
    description:
      "Empowering Indian voters with interactive tools, quizzes, and AI-powered election guidance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <FloatingYatriAI />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
