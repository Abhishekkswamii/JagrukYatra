"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BADGES } from "@/lib/journeyData";

interface Props {
  unlockedBadges: string[];
}

export default function BadgesPanel({ unlockedBadges }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-base font-bold text-gray-900"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          🏅 Your Badges
        </h3>
        <span className="text-xs font-semibold bg-orange-50 text-[#FF6B00] px-2.5 py-1 rounded-full border border-orange-100">
          {unlockedBadges.length}/{BADGES.length} earned
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {BADGES.map((badge, i) => {
          const earned = unlockedBadges.includes(badge.id);
          return (
            <AnimatePresence key={badge.id}>
              <motion.div
                initial={earned ? { scale: 0.5, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                className={`relative p-3 rounded-2xl border text-center transition-all ${
                  earned
                    ? `${badge.color} shadow-sm`
                    : "bg-gray-50 border-gray-100 opacity-40 grayscale"
                }`}
              >
                {earned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-[10px] font-bold leading-tight">{badge.title}</div>
                <div className="text-[9px] mt-0.5 opacity-70 leading-tight">{badge.description}</div>
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}
