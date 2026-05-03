"use client";

import { motion, type Variants } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, MapPin, Users, Shield,
  Route, Cpu, BookOpen, HelpCircle, Bot, FileCheck, Sparkles,
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

/* ════════════════════════════════════════════
   Hero Section
════════════════════════════════════════════ */
function HeroSection() {
  const { t } = useTranslation();
  
  const stats = [
    { icon: Users, value: "96.8 Cr", label: t("Registered Voters") },
    { icon: MapPin, value: "10.5 Lakh", label: t("Polling Stations") },
    { icon: Shield, value: "543", label: t("Lok Sabha Seats") },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden gradient-hero pt-16"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-orange-100/60 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[360px] h-[360px] rounded-full bg-orange-50/80 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[280px] h-[280px] rounded-full bg-amber-50/70 blur-2xl" />
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-[#FF6B00]" />
          <div className="flex-1 bg-white border-y border-orange-100" />
          <div className="flex-1 bg-[#1A2C6B]" />
        </div>
        {/* Premium Ashoka Chakra Display */}
        <div className="absolute lg:right-12 xl:right-28 top-[55%] -translate-y-1/2 pointer-events-none select-none hidden lg:block opacity-[0.12] dark:opacity-30 mix-blend-multiply dark:mix-blend-normal">
          <div className="relative flex items-center justify-center">
            {/* Tricolor background circle */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-b from-[#FF671F] via-white to-[#046A38] opacity-30 dark:opacity-20 blur-[2px]" />
            
            {/* White glow for dark mode contrast */}
            <div className="absolute inset-0 rounded-full bg-white opacity-0 dark:opacity-40 blur-3xl" />
            
            {/* Spinning Navy Blue Chakra */}
            <motion.svg 
              viewBox="0 0 200 200" 
              className="w-[360px] h-[360px] xl:w-[420px] xl:h-[420px] relative z-10 dark:drop-shadow-[0_0_30px_rgba(255,103,31,0.5)]"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
            >
              {/* Outer ring */}
              <circle cx="100" cy="100" r="96" fill="none" stroke="#06038D" strokeWidth="4" />
              {/* Inner dot */}
              <circle cx="100" cy="100" r="12" fill="#06038D" />
              {/* 24 spokes */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                return (
                  <line key={i}
                    x1={+(100 + 14 * Math.cos(rad)).toFixed(2)}
                    y1={+(100 + 14 * Math.sin(rad)).toFixed(2)}
                    x2={+(100 + 94 * Math.cos(rad)).toFixed(2)}
                    y2={+(100 + 94 * Math.sin(rad)).toFixed(2)}
                    stroke="#06038D" strokeWidth="2"
                  />
                );
              })}
            </motion.svg>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <div className="max-w-3xl">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-500 mb-5 tracking-wide">
            {t("🇮🇳 India's Election Awareness Platform")}
          </motion.p>

          <motion.h1
            custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-gray-900 dark:text-foreground"
          >
            {t("Your Personal")} <span className="gradient-text">{t("Election")}</span><br />
            <span className="text-[#1A2C6B] dark:text-[#CBD5E1]">{t("Awareness Journey")}</span>
          </motion.h1>

          <motion.p
            custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-muted-foreground max-w-2xl mb-8 leading-relaxed"
          >
            {t("JagrukYatra guides every Indian citizen through their democratic rights — from voter registration to understanding candidates, busting myths, and making an informed choice.")}
            {" "}
            <strong className="text-gray-800 dark:text-foreground">{t("Democracy starts with you.")}</strong>
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="#whats-inside" className="bg-[#FF6B00] text-white px-7 py-4 rounded-2xl font-semibold shadow-lg">
              {t("Start Your Yatra")}
            </Link>
            <Link href="/yatri-ai" className="border-2 border-[#1A2C6B] text-[#1A2C6B] px-7 py-4 rounded-2xl font-semibold">
              {t("Ask Yatri AI")}
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-xl">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl sm:text-2xl font-bold gradient-text">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   What's Inside — 6 Feature Cards
════════════════════════════════════════════ */
function WhatsInsideSection() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const features = [
    {
      icon: Route, title: t("My Journey"), href: "/my-journey",
      description: t("Your personalised roadmap — from voter registration to election day."),
      color: "bg-orange-100", iconColor: "text-[#FF6B00]", badge: t("Personal"),
    },
    {
      icon: Cpu, title: t("Election Simulator"), href: "/simulator",
      description: t("Experience a realistic EVM voting booth and explore election scenarios."),
      color: "bg-blue-50", iconColor: "text-[#1A2C6B]", badge: t("Interactive"),
    },
    {
      icon: BookOpen, title: t("Myth Buster"), href: "/myth-buster",
      description: t("Swipe through election myths and facts — verified by ECI sources."),
      color: "bg-amber-50", iconColor: "text-amber-600", badge: t("Truth"),
    },
    {
      icon: HelpCircle, title: t("Quiz"), href: "/quiz",
      description: t("Test your democratic knowledge with timed quizzes across 4 categories."),
      color: "bg-green-50", iconColor: "text-green-600", badge: t("Learn"),
    },
    {
      icon: Bot, title: t("Yatri AI"), href: "/yatri-ai",
      description: t("Your intelligent companion for all things Indian democracy."),
      color: "bg-purple-50", iconColor: "text-purple-600", badge: t("AI-Powered"),
    },
  ];

  return (
    <section id="whats-inside" className="py-20 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-[#FF6B00] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            {t("What's Inside")}
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-4">
            {t("Everything you need to be a")} <span className="gradient-text">{t("Jagruk Naagrik")}</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {t("Six powerful tools designed to make every Indian an informed, empowered voter.")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Link key={feature.title} href={feature.href} className="border border-orange-100 rounded-2xl p-6 block h-full shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-semibold bg-orange-50 text-[#FF6B00] px-2 py-0.5 rounded-full">
                {feature.badge}
              </span>
              <h3 className="text-lg font-bold mt-4 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.description}</p>
              <div className="mt-4 text-[#FF6B00] text-sm font-semibold flex items-center gap-1">
                {t("Explore")} <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   Yatri AI Teaser
════════════════════════════════════════════ */
function YatriAITeaser() {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-[#1A2C6B] text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h3 className="text-3xl font-bold mb-4">{t("Meet")} <span className="text-[#FF8C38]">Yatri AI</span></h3>
        <p className="text-blue-200 mb-8">{t("Your intelligent companion for all things Indian democracy. Ask about voting rights, election dates, candidate profiles, NOTA, EVMs — in any language.")}</p>
        <Link href="/yatri-ai" className="bg-[#FF6B00] px-6 py-3 rounded-xl font-semibold shadow-lg">
          {t("Chat with Yatri AI")}
        </Link>
      </div>
    </section>
  );
}

export default function HomeContent() {
  return (
    <>
      <HeroSection />
      <WhatsInsideSection />
      <YatriAITeaser />
    </>
  );
}
