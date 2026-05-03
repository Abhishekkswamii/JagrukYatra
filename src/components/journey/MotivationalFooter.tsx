"use client";

import { motion } from "framer-motion";
import type { UserProfile } from "@/lib/journeyData";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  profile: UserProfile;
  score: number;
  badgesEarned: number;
}

const getMessage = (profile: UserProfile, score: number) => {
  if (profile.firstTimeVoter && score < 20) {
    return {
      emoji: "🌱",
      title: "Every legend starts at Stage One",
      body: `Welcome, first-time voter from ${profile.state}! You've just taken the most important step — showing up. India's democracy got stronger the moment you started your Yatra. Keep going — each stage you complete makes you a more powerful citizen.`,
      cta: "Continue Your Journey",
    };
  }
  if (profile.firstTimeVoter && score >= 20 && score < 60) {
    return {
      emoji: "🚀",
      title: "You're becoming a Jagruk Naagrik",
      body: `You're already more informed than most first-time voters your age! Your commitment to understanding democracy is exactly what India needs from the ${profile.ageGroup} generation. The Yatra is yours — finish it strong.`,
      cta: "Unlock More Stages",
    };
  }
  if (profile.firstTimeVoter && score >= 60) {
    return {
      emoji: "🏆",
      title: "You are the democracy India deserves",
      body: `Incredible, first-time voter! You've completed most of your Yatra. Share this journey with your friends — if every first-time voter in ${profile.state} was as informed as you, it would transform the election landscape.`,
      cta: "Share Your Yatra",
    };
  }
  if (score < 30) {
    return {
      emoji: "🌅",
      title: "Your Yatra is just beginning",
      body: `Democracy isn't just a right — it's a practice. You've started your journey as a voter in ${profile.state}. Complete the stages ahead; each one will deepen your understanding and sharpen your vote.`,
      cta: "Keep Exploring",
    };
  }
  if (score >= 30 && score < 70) {
    return {
      emoji: "⚡",
      title: "You're halfway to Jagruk status",
      body: `Solid progress! Voters like you — from ${profile.state}, in the ${profile.ageGroup} age group — are the backbone of India's democratic resilience. Complete the remaining stages to earn the full Jagruk Naagrik title.`,
      cta: "Finish Strong",
    };
  }
  return {
    emoji: "🇮🇳",
    title: "Jai Hind! You are a true Jagruk Naagrik",
    body: `You've done what millions of voters haven't — you've understood the complete arc of Indian democracy. Your vote from ${profile.state} carries the weight of knowledge, intent, and conscience. That's the most powerful vote in any election.`,
    cta: "Ask Yatri AI",
  };
};

export default function MotivationalFooter({ profile, score, badgesEarned }: Props) {
  const msg = getMessage(profile, score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative bg-[#1A2C6B] rounded-3xl overflow-hidden"
    >
      {/* Decorative orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#FF6B00]/10 blur-2xl" />
      </div>

      {/* Tricolour top strip */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-[#FF6B00]" />
        <div className="flex-1 bg-white/30" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      <div className="relative p-8 sm:p-10 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-5xl mb-4"
        >
          {msg.emoji}
        </motion.div>

        <h3
          className="text-2xl sm:text-3xl font-extrabold text-white mb-3"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          {msg.title}
        </h3>
        <p className="text-blue-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-6">
          {msg.body}
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="text-center">
            <div
              className="text-3xl font-extrabold text-[#FF8C38]"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {score}
            </div>
            <div className="text-xs text-blue-300 mt-0.5">Jagruk Score</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div
              className="text-3xl font-extrabold text-amber-300"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {badgesEarned}
            </div>
            <div className="text-xs text-blue-300 mt-0.5">Badges Earned</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div
              className="text-3xl font-extrabold text-green-300"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              🇮🇳
            </div>
            <div className="text-xs text-blue-300 mt-0.5">Jai Hind</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="#yatri-ai"
            className="inline-flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E05500] text-white font-bold px-6 py-3 rounded-2xl transition-colors"
          >
            {msg.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "My JagrukYatra Journey",
                  text: `I scored ${score}/100 on my JagrukYatra election awareness journey! 🇮🇳`,
                  url: window.location.href,
                });
              }
            }}
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
          >
            <Heart className="w-4 h-4 text-red-400" />
            Share My Journey
          </button>
        </div>
      </div>
    </motion.div>
  );
}
