"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, MapPin, Users, Star } from "lucide-react";
import { STATES, AGE_GROUPS, type UserProfile } from "@/lib/journeyData";

interface Props {
  onGenerate: (profile: UserProfile) => void;
}

export default function PersonalizationForm({ onGenerate }: Props) {
  const [state, setState] = useState("Pan India");
  const [ageGroup, setAgeGroup] = useState("18–24");
  const [firstTime, setFirstTime] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onGenerate({ state, ageGroup, firstTimeVoter: firstTime });
      setLoading(false);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto"
    >
      {/* Card */}
      <div className="relative bg-white dark:bg-card rounded-3xl shadow-xl shadow-orange-100 dark:shadow-[0_0_40px_rgba(255,103,31,0.05)] border border-orange-100 dark:border-[#1e325c] overflow-hidden">
        {/* Top tricolour band */}
        <div className="flex h-1.5">
          <div className="flex-1 bg-[#FF6B00]" />
          <div className="flex-1 bg-white border-y border-orange-100" />
          <div className="flex-1 bg-[#1A2C6B]" />
        </div>

        {/* Decorative bg */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-50 dark:bg-orange-500/5 opacity-60" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-blue-50 dark:bg-blue-500/5 opacity-40" />
        </div>

        <div className="relative p-8 sm:p-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <span className="text-xs font-semibold text-[#FF6B00] uppercase tracking-wider">
              Personalize Your Yatra
            </span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-foreground mb-1 leading-snug"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Tell us about yourself
          </h2>
          <p className="text-gray-500 dark:text-muted-foreground text-sm mb-8">
            We&apos;ll tailor your election journey with state-specific insights and tips just for you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* State */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 text-[#FF6B00]" />
                Your State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                aria-label="Select your state"
                className="w-full bg-orange-50/60 dark:bg-[#13223F] border border-orange-200 dark:border-[#1e325c] text-gray-800 dark:text-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/40 focus:border-[#FF6B00] transition-all appearance-none cursor-pointer"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Group */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4 text-[#1A2C6B] dark:text-blue-400" />
                Age Group
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AGE_GROUPS.map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setAgeGroup(age)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      ageGroup === age
                        ? "bg-[#1A2C6B] border-[#1A2C6B] text-white shadow-md"
                        : "bg-white dark:bg-[#13223F] border-gray-200 dark:border-[#1e325c] text-gray-600 dark:text-gray-400 hover:border-[#1A2C6B] dark:hover:border-blue-500 hover:text-[#1A2C6B] dark:hover:text-blue-400"
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* First Time Voter Toggle */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Star className="w-4 h-4 text-amber-500" />
                First Time Voter?
              </label>
              <div className="flex items-center gap-0 bg-gray-100 dark:bg-black/20 rounded-xl p-1 w-fit border border-transparent dark:border-[#1e325c]">
                <button
                  type="button"
                  onClick={() => setFirstTime(true)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    firstTime
                      ? "bg-[#FF6B00] text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Yes ✨
                </button>
                <button
                  type="button"
                  onClick={() => setFirstTime(false)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    !firstTime
                      ? "bg-[#1A2C6B] text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  No
                </button>
              </div>
              {firstTime && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 text-xs text-[#FF6B00] font-medium"
                >
                  Welcome to democracy! We&apos;ll add extra guidance throughout your journey.
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-[#FF6B00] hover:bg-[#E05500] disabled:opacity-70 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-[0_0_20px_rgba(255,103,31,0.2)] hover:shadow-orange-300 transition-all text-base"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {loading ? (
                <>
                  <span className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </span>
                  Crafting your personal Yatra...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate My Personal Election Yatra
                </>
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
