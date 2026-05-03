"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, MapPin, Users, Shield,
  Route, Cpu, BookOpen, HelpCircle, Bot,
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
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16"
    >
      {/* 🇮🇳 Blurred Indian National Flag Background (Light Theme Only) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden dark:hidden bg-white">
        {/* Flag Gradient Layer */}
        <div 
          className="absolute inset-0 opacity-[0.22] blur-[110px] scale-110 transform-gpu"
          style={{
            background: `linear-gradient(to bottom, #FF671F 0%, #FFFFFF 50%, #046A38 100%)`
          }}
        />
        
        {/* Subtle Dots Pattern for Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.2]" />
        
        {/* Soft Contrast Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white/20 to-transparent" />
      </div>

      {/* Hero Background Shapes (Dark Theme Only) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 dark:opacity-100 bg-[#020B1F]">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-blue-900/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[280px] h-[280px] rounded-full bg-indigo-900/20 blur-2xl" />
      </div>

      {/* Main Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 z-10">
        <div className="max-w-3xl">
          {/* Tagline */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="inline-flex items-center gap-2 bg-white/60 dark:bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-orange-100/50 dark:border-white/10 mb-6"
          >
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.1em] uppercase text-gray-500 dark:text-gray-400">
              {t("🇮🇳 India's Election Awareness Platform")}
            </span>
          </motion.div>

          {/* H1 Heading */}
          <motion.h1
            custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 text-gray-900 dark:text-white"
          >
            {t("Your Personal")} <span className="gradient-text">{t("Election")}</span><br />
            <span className="text-[#1A2C6B] dark:text-[#CBD5E1]">{t("Awareness Journey")}</span>
          </motion.h1>

          {/* Body Paragraph */}
          <motion.p
            custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-muted-foreground max-w-2xl mb-8 leading-relaxed"
          >
            {t("JagrukYatra guides every Indian citizen through their democratic rights — from voter registration to understanding candidates, busting myths, and making an informed choice.")}
            {" "}
            <strong className="text-gray-800 dark:text-foreground font-semibold">{t("Democracy starts with you.")}</strong>
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Link href="#whats-inside" className="bg-[#FF6B00] hover:bg-[#E05500] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-center">
              {t("Start Your Yatra")}
            </Link>
            <Link href="/yatri-ai" className="bg-white/80 dark:bg-white/5 backdrop-blur-md border-2 border-[#1A2C6B] text-[#1A2C6B] dark:text-blue-300 dark:border-blue-900/50 px-8 py-4 rounded-2xl font-bold transition-all hover:bg-[#1A2C6B] hover:text-white text-center">
              {t("Ask Yatri AI")}
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            custom={4} variants={fadeUp} initial="hidden" animate="visible"
            className="mt-14 grid grid-cols-3 gap-6 sm:gap-10 max-w-xl"
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="group">
                <div className="text-2xl sm:text-3xl font-black text-[#1A2C6B] dark:text-[#FF8C38] mb-1">{value}</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-[#FF6B00] transition-colors">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ☸️ Premium Ashoka Chakra Display */}
      <div className="absolute lg:right-4 xl:right-16 top-[55%] -translate-y-1/2 pointer-events-none select-none hidden lg:block opacity-[0.15] dark:opacity-30 mix-blend-multiply dark:mix-blend-normal z-0">
        <div className="relative flex items-center justify-center">
          {/* Subtle tricolor glow behind the Chakra */}
          <div className="absolute inset-10 rounded-full bg-gradient-to-b from-[#FF671F] via-white to-[#046A38] opacity-20 blur-3xl" />
          
          <motion.svg 
            viewBox="0 0 200 200" 
            className="w-[420px] h-[420px] xl:w-[500px] xl:h-[500px] relative dark:drop-shadow-[0_0_30px_rgba(255,103,31,0.5)]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            <circle cx="100" cy="100" r="96" fill="none" stroke="#06038D" strokeWidth="3" />
            <circle cx="100" cy="100" r="12" fill="#06038D" />
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              const rad = (angle * Math.PI) / 180;
              return (
                <line key={i}
                  x1={+(100 + 14 * Math.cos(rad)).toFixed(2)}
                  y1={+(100 + 14 * Math.sin(rad)).toFixed(2)}
                  x2={+(100 + 94 * Math.cos(rad)).toFixed(2)}
                  y2={+(100 + 94 * Math.sin(rad)).toFixed(2)}
                  stroke="#06038D" strokeWidth="2.5"
                />
              );
            })}
          </motion.svg>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════
   What's Inside — 5 Feature Cards
════════════════════════════════════════════ */
function WhatsInsideSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Route, title: t("My Journey"), href: "/my-journey",
      description: t("Your personalised roadmap — from voter registration to election day."),
      color: "bg-orange-50/50", iconColor: "text-[#FF6B00]", badge: t("Personal"),
    },
    {
      icon: Cpu, title: t("Election Simulator"), href: "/simulator",
      description: t("Experience a realistic EVM voting booth and explore election scenarios."),
      color: "bg-blue-50/50", iconColor: "text-[#1A2C6B]", badge: t("Interactive"),
    },
    {
      icon: BookOpen, title: t("Myth Buster"), href: "/myth-buster",
      description: t("Swipe through election myths and facts — verified by ECI sources."),
      color: "bg-amber-50/50", iconColor: "text-amber-600", badge: t("Truth"),
    },
    {
      icon: HelpCircle, title: t("Quiz"), href: "/quiz",
      description: t("Test your democratic knowledge with timed quizzes across 4 categories."),
      color: "bg-green-50/50", iconColor: "text-green-600", badge: t("Learn"),
    },
    {
      icon: Bot, title: t("Yatri AI"), href: "/yatri-ai",
      description: t("Your intelligent companion for all things Indian democracy."),
      color: "bg-purple-50/50", iconColor: "text-purple-600", badge: t("AI-Powered"),
    },
  ];

  return (
    <section id="whats-inside" className="py-24 bg-white dark:bg-background relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-100 dark:via-blue-900 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#FF6B00] text-xs font-bold tracking-[0.2em] uppercase mb-4"
          >
            {t("What's Inside")}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black mb-6 tracking-tight text-gray-900 dark:text-white"
          >
            {t("Everything you need to be a")} <span className="gradient-text">{t("Jagruk Naagrik")}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg"
          >
            {t("Six powerful tools designed to make every Indian an informed, empowered voter.")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={feature.href} className="group border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 block h-full bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all hover:-translate-y-1 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 ${feature.color} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full mb-6 inline-block">
                  {feature.badge}
                </span>
                
                <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 group-hover:scale-110 group-hover:bg-[#FF6B00]/10 transition-all">
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                
                <h3 className="text-xl font-black mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{feature.description}</p>
                
                <div className="text-[#FF6B00] text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  {t("Explore")} <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
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
    <section className="py-24 bg-[#1A2C6B] text-white relative overflow-hidden">
      {/* Decorative elements for AI section */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-blue-400 blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-orange-400 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-8 inline-block px-6 py-2 rounded-full border border-blue-400/30 bg-blue-400/10 backdrop-blur-sm"
        >
          <span className="text-blue-300 text-sm font-bold uppercase tracking-[0.2em]">{t("AI Assistant")}</span>
        </motion.div>
        
        <h3 className="text-4xl sm:text-5xl font-black mb-6">{t("Meet")} <span className="text-[#FF8C38]">Yatri AI</span></h3>
        <p className="text-blue-100/80 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
          {t("Your intelligent companion for all things Indian democracy. Ask about voting rights, election dates, candidate profiles, NOTA, EVMs — in any language.")}
        </p>
        
        <Link href="/yatri-ai" className="inline-flex items-center gap-3 bg-[#FF6B00] hover:bg-[#E05500] px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 group">
          {t("Chat with Yatri AI")}
          <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

export default function HomeContent() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <WhatsInsideSection />
      <YatriAITeaser />
    </main>
  );
}
