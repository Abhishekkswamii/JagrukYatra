"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { STATES, AGE_GROUPS } from "@/lib/journeyData";

interface Props {
  isOpen: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onComplete }: Props) {
  const { firebaseUser, saveProgress } = useAuth();
  const [state, setState] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [isFirstTimeVoter, setIsFirstTimeVoter] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = state && ageGroup && isFirstTimeVoter !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !canSubmit) return;
    setLoading(true);
    await saveProgress({ state, ageGroup, isFirstTimeVoter: isFirstTimeVoter!, onboardingComplete: true });
    setLoading(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="ob-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            key="ob-modal"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#FF6B00] via-white to-[#1A2C6B]" />
              <div className="p-7">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🇮🇳</div>
                  <h2
                    className="text-2xl font-extrabold text-gray-900"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Personalise Your Yatra
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Help us make your journey more relevant (takes 30 seconds)
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* State */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your State / UT</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] transition-colors bg-white"
                    >
                      <option value="">Select your state…</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Age group */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age Group</label>
                    <div className="grid grid-cols-4 gap-2">
                      {AGE_GROUPS.map((ag) => (
                        <button
                          key={ag}
                          type="button"
                          onClick={() => setAgeGroup(ag)}
                          className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150 ${
                            ageGroup === ag
                              ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                              : "border-gray-200 text-gray-600 hover:border-orange-200"
                          }`}
                        >
                          {ag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* First-time voter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Are you a first-time voter?</label>
                    <div className="grid grid-cols-2 gap-3">
                      {([true, false] as const).map((val) => (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => setIsFirstTimeVoter(val)}
                          className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                            isFirstTimeVoter === val
                              ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                              : "border-gray-200 text-gray-600 hover:border-orange-200"
                          }`}
                        >
                          {val ? "Yes, first time! 🌱" : "No, I've voted before 🗳️"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E05500] text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start My Yatra →"}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
