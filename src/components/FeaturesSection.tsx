"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Route, Cpu, BookOpen, HelpCircle, Bot, FileCheck } from "lucide-react";

const features = [
  {
    icon: Route,
    title: "My Journey",
    description:
      "A personalised roadmap tracking your voter awareness progress — from registration to election day.",
    color: "bg-orange-100 dark:bg-orange-500/20",
    iconColor: "text-[#FF6B00]",
    badge: "Personal",
  },
  {
    icon: Cpu,
    title: "Election Simulator",
    description:
      "Simulate election scenarios, understand FPTP vs proportional systems, and see how votes translate to seats.",
    color: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-[#1A2C6B]",
    badge: "Interactive",
  },
  {
    icon: BookOpen,
    title: "Myth Buster",
    description:
      "India's most common election myths — fact-checked with official ECI sources and research data.",
    color: "bg-amber-50 dark:bg-amber-500/20",
    iconColor: "text-amber-600",
    badge: "Truth",
  },
  {
    icon: HelpCircle,
    title: "Quiz",
    description:
      "Test your democratic knowledge with curated quizzes on voting rights, Constitution, and election history.",
    color: "bg-green-50 dark:bg-green-500/20",
    iconColor: "text-green-600",
    badge: "Learn",
  },
  {
    icon: Bot,
    title: "Yatri AI",
    description:
      "Your intelligent guide — ask anything about elections, candidates, constituencies, or voting process.",
    color: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-600",
    badge: "AI-Powered",
  },
  {
    icon: FileCheck,
    title: "Voter Tools",
    description:
      "Check your voter ID status, find your polling booth, download form 6/6A/7, and more in one place.",
    color: "bg-rose-50 dark:bg-rose-900/20",
    iconColor: "text-rose-600",
    badge: "Utility",
  },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="journey" className="py-24 bg-white dark:bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-[#FF6B00] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            What&apos;s Inside
          </span>
          <h2
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-foreground mb-4 leading-tight"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Everything you need to be a{" "}
            <span className="gradient-text">Jagruk Naagrik</span>
          </h2>
          <p className="text-gray-500 dark:text-muted-foreground text-lg max-w-2xl mx-auto">
            Six powerful tools designed to make every Indian an informed, empowered voter.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="card-hover group relative bg-white dark:bg-card border border-orange-100 dark:border-[#1e325c] rounded-2xl p-6 shadow-sm dark:shadow-[0_0_30px_rgba(255,103,31,0.02)] hover:border-orange-200 dark:hover:border-orange-500/40 transition-colors"
            >
              {/* Badge */}
              <span className="absolute top-4 right-4 text-[10px] font-semibold bg-orange-50 dark:bg-orange-500/10 text-[#FF6B00] px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-500/20">
                {feature.badge}
              </span>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>

              <h3
                className="text-lg font-bold text-gray-900 dark:text-foreground mb-2"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-muted-foreground text-sm leading-relaxed">{feature.description}</p>

              {/* Arrow on hover */}
              <div className="mt-4 flex items-center gap-1 text-[#FF6B00] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Explore
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
