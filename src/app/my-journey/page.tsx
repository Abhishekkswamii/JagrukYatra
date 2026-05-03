"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PersonalizationForm from "@/components/journey/PersonalizationForm";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import AuthModal from "@/components/auth/AuthModal";
import type { UserProfile } from "@/lib/journeyData";

// Note: metadata can't be in a "use client" component — SEO handled by layout

import { useAuth } from "@/context/AuthContext";

export default function MyJourneyPage() {
  const { firebaseUser, userDoc, saveProgress, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const openLogin = () => {
    setAuthTab("login");
    setAuthOpen(true);
  };

  // Auto-load profile on mount
  useEffect(() => {
    if (authLoading) return; // Wait for auth to settle

    let loadedProfile = null;

    // Try to load from local storage
    try {
      const raw = localStorage.getItem("jagrukyatra_user_profile");
      if (raw) {
        loadedProfile = JSON.parse(raw);
      }
    } catch { /* ignore */ }

    if (firebaseUser && userDoc) {
      if (userDoc.state && userDoc.ageGroup) {
        // User has a profile in Firestore
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile({
          state: userDoc.state,
          ageGroup: userDoc.ageGroup,
          firstTimeVoter: userDoc.isFirstTimeVoter ?? false,
        });
      } else if (loadedProfile) {
        // User logged in but no profile in Firestore, migrate local profile
        setProfile(loadedProfile);
        saveProgress({
          state: loadedProfile.state,
          ageGroup: loadedProfile.ageGroup,
          isFirstTimeVoter: loadedProfile.firstTimeVoter,
        }).catch(() => {});
      }
    } else if (loadedProfile) {
      // Guest with local profile
      setProfile(loadedProfile);
    }
    
    setIsProfileLoaded(true);
  }, [firebaseUser, userDoc, saveProgress, authLoading]);

  const handleGenerate = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    
    // Save locally
    localStorage.setItem("jagrukyatra_user_profile", JSON.stringify(newProfile));

    // Save to Firestore if logged in
    if (firebaseUser) {
      await saveProgress({
        state: newProfile.state,
        ageGroup: newProfile.ageGroup,
        isFirstTimeVoter: newProfile.firstTimeVoter,
      });
    }
  };

  // Show hero only when no profile yet
  const showHero = isProfileLoaded && !profile;

  return (
    <>
      <Navbar />

      {/* Auth modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />

      {/* ── HERO: shown only before personalization ── */}
      <AnimatePresence>
        {showHero && (
          <motion.section
            key="hero"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45 }}
            className="relative pt-24 pb-12 overflow-hidden gradient-hero"
          >
            {/* Tricolour stripe */}
            <div className="absolute top-0 left-0 right-0 flex h-1.5">
              <div className="flex-1 bg-[#FF6B00]" />
              <div className="flex-1 bg-white border-y border-orange-100" />
              <div className="flex-1 bg-[#1A2C6B]" />
            </div>

            {/* Chakra watermark */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none hidden lg:block">
              <svg viewBox="0 0 200 200" className="w-72 h-72 ashok-chakra-spin">
                <circle cx="100" cy="100" r="95" fill="none" stroke="#0047A0" strokeWidth="4" />
                <circle cx="100" cy="100" r="12" fill="#0047A0" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  const rad = (angle * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={+(100 + 14 * Math.cos(rad)).toFixed(2)}
                      y1={+(100 + 14 * Math.sin(rad)).toFixed(2)}
                      x2={+(100 + 91 * Math.cos(rad)).toFixed(2)}
                      y2={+(100 + 91 * Math.sin(rad)).toFixed(2)}
                      stroke="#0047A0"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-[#FF6B00] text-xs font-semibold px-4 py-1.5 rounded-full mb-4"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
                Official ECI Election Process · Personalised for You
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.55 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                My <span className="gradient-text">Election</span>
                <br />
                <span className="text-[#1A2C6B] dark:text-blue-400">Yatra</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto"
              >
                Learn the <strong className="text-gray-700 dark:text-gray-200">8 official stages</strong> of
                the Indian election process — your role at each step, and checkpoints to mark as understood.
              </motion.p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── COMPACT BAR: shown after personalization ── */}
      <AnimatePresence>
        {isProfileLoaded && profile && (
          <motion.div
            key="compact-bar"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="pt-16 bg-white dark:bg-background"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                <span className="text-sm font-bold text-gray-800 dark:text-white" style={{ fontFamily: "var(--font-poppins)" }}>
                  My Election Yatra
                </span>
                <span className="hidden sm:inline text-gray-300 dark:text-gray-600">·</span>
                <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Official ECI Process · {profile.state} · {profile.ageGroup}
                  {profile.firstTimeVoter && <span className="ml-1 text-[#FF6B00]">✨ First Voter</span>}
                </span>
              </div>
              <div className="flex h-1 w-24 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-900/30">
                <div className="h-full bg-[#FF6B00] rounded-full" style={{ width: "33%" }} />
                <div className="h-full bg-white dark:bg-background" style={{ width: "34%" }} />
                <div className="h-full bg-[#1A2C6B] rounded-full" style={{ width: "33%" }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className={`flex-1 bg-white dark:bg-background transition-colors duration-300 ${isProfileLoaded && profile ? "pt-0 pb-12" : "py-10 sm:py-12"}`}>
        <AnimatePresence mode="wait">
          {!isProfileLoaded ? (
            <div key="loading" className="flex items-center justify-center py-20">
              <span className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2.5 h-2.5 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2.5 h-2.5 bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          ) : !profile ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
              className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <PersonalizationForm onGenerate={handleGenerate} />
            </motion.div>
          ) : (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <JourneyTimeline
                profile={profile}
                onReset={() => {
                  setProfile(null);
                  localStorage.removeItem("jagrukyatra_user_profile");
                }}
                onOpenLogin={openLogin}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}
