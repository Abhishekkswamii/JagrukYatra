"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, CheckCircle2, RefreshCw, LogIn, Cloud, HardDrive, Award, Download } from "lucide-react";
import { STAGES, BADGES, VALID_SLUGS, countValidStages, type UserProfile } from "@/lib/journeyData";
import TimelineStage from "./TimelineStage";
import CelebrationModal from "./CelebrationModal";
import { useAuth } from "@/context/AuthContext";
import { downloadCertificate } from "@/lib/certificateUtils";
import { markModuleComplete, updateUserProgress } from "@/lib/firestore";

interface Props {
  profile: UserProfile;
  onReset: () => void;
  onOpenLogin?: () => void;
}

const STORAGE_KEY = "jagrukyatra_journey_progress";

interface SavedProgress {
  checkedItems: string[];
}

function loadFromLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const saved: SavedProgress = JSON.parse(raw);
    return saved.checkedItems || [];
  } catch { /* ignore */ }
  return [];
}

function saveToLocal(checkedItems: string[]) {
  if (typeof window === "undefined") return;
  const data: SavedProgress = { checkedItems };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Journey score: each of 8 stages = 12.5 pts, hard-capped at 100. */
function computeScore(checkedItems: string[]): number {
  const completed = countValidStages(checkedItems);
  const total = STAGES.length; // 8
  if (total === 0) return 0;
  return Math.min(Math.round((completed / total) * 100), 100);
}

function computeBadges(checkedItems: string[], stagesCompleted: number, score: number): string[] {
  const earned: string[] = [];

  if (checkedItems.includes("voter-registration")) earned.push("first-step");
  if (checkedItems.includes("nomination")) earned.push("researcher");
  if (checkedItems.includes("polling")) earned.push("sacred-voter");

  if (stagesCompleted >= 4) earned.push("halfway");
  if (stagesCompleted >= 6) earned.push("informed-voter");
  if (stagesCompleted >= 8) earned.push("yatra-completer");

  if (score >= 80) earned.push("fact-checker");

  return earned;
}

export default function JourneyTimeline({ profile, onReset, onOpenLogin }: Props) {
  const { firebaseUser, userDoc, refreshUserDoc } = useAuth();

  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [mounted, setMounted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  // Guard: only celebrate once per session (not on cold load)
  const hasCelebratedRef = useRef(false);

  /* ── Load progress: Firestore (logged in) or localStorage (guest) ── */
  useEffect(() => {
    setMounted(true);
    const localData = loadFromLocal();
    // Strip any stale old checklist IDs — only keep valid stage slugs
    const sanitize = (items: string[]) => items.filter((id) => VALID_SLUGS.has(id));

    if (firebaseUser && userDoc) {
      // Logged in
      if ((!userDoc.completedChecklist || userDoc.completedChecklist.length === 0) && localData.length > 0) {
        // Migrate local to Firestore (sanitised)
        const clean = sanitize(localData);
        setCheckedItems(clean);
        updateUserProgress(firebaseUser.uid, { completedChecklist: clean }).catch(() => {});
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setCheckedItems(sanitize(userDoc.completedChecklist ?? []));
      }
    } else {
      // Guest — use localStorage (sanitised)
      setCheckedItems(sanitize(localData));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, userDoc]);

  /* ── Auto-save to localStorage always (guest + logged in as backup) ── */
  useEffect(() => {
    if (!mounted) return;
    saveToLocal(checkedItems);
    
    // Auto-save instantly to Firestore if logged in
    if (firebaseUser) {
      setSaveStatus("saving");

      const score = computeScore(checkedItems);
      // Write journey score absolutely (capped at 100) — never additive to avoid overflow
      updateUserProgress(firebaseUser.uid, {
        completedChecklist: checkedItems,
        jagrukScore: score, // absolute value, safe to write directly
      }).then(async () => {
        if (score >= 50) {
          await markModuleComplete(firebaseUser.uid, "my-journey");
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      }).catch(() => {
        setSaveStatus("idle");
      });
    } else {
      // Guest auto-save visual feedback
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedItems]);

  /* ── Save progress (manual button - now just a force sync/refresh) ── */
  const saveProgress = useCallback(async () => {
    setSaveStatus("saving");
    saveToLocal(checkedItems);

    if (firebaseUser) {
      const score = computeScore(checkedItems);
      try {
        await updateUserProgress(firebaseUser.uid, {
          completedChecklist: checkedItems,
          jagrukScore: score, // absolute, capped at 100
        });
        if (score >= 50) {
          await markModuleComplete(firebaseUser.uid, "my-journey");
        }
        await refreshUserDoc();
      } catch { /* offline */ }
    }

    setTimeout(() => setSaveStatus("saved"), 600);
    setTimeout(() => setSaveStatus("idle"), 2500);
  }, [checkedItems, firebaseUser, refreshUserDoc]);

  /* ── Toggle a checklist item + trigger celebration ── */
  const handleToggle = useCallback((id: string) => {
    setCheckedItems((prev) => {
      const isAdding = !prev.includes(id);
      const next = isAdding ? [...prev, id] : prev.filter((x) => x !== id);

      // Only trigger celebration when ADDING Stage 7 or Stage 8 for the first time
      const isMilestoneStage = id === "counting" || id === "government-formation";
      if (isAdding && isMilestoneStage && !hasCelebratedRef.current) {
        hasCelebratedRef.current = true;
        setTimeout(() => setShowCelebration(true), 650);
      }

      return next;
    });
  }, []);

  const totalStages = STAGES.length; // always 8
  const stagesCompleted = Math.min(countValidStages(checkedItems), totalStages); // 0-8, never exceeds 8
  const score = computeScore(checkedItems); // 0-100, real slugs only
  const unlockedBadges = computeBadges(checkedItems, stagesCompleted, score);

  if (!mounted) return null;

  const isGuest = !firebaseUser;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* ── Guest banner ── */}
      {isGuest && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 py-3">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-sm">
              <HardDrive className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
              <span>
                <strong className="dark:text-amber-300">Guest mode</strong> — Progress saved locally on this device only.
              </span>
            </div>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E05500] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors touch-target shadow-md shadow-orange-500/20"
            >
              <LogIn className="w-3.5 h-3.5" /> Login to Save Permanently
            </button>
          </div>
        </div>
      )}

      {/* ── Sticky top bar ── */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-[#020B1F]/95 backdrop-blur-sm border-b border-orange-100 dark:border-[#0F1C38] shadow-sm mb-8">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Profile context */}
              <span className="text-sm font-semibold text-gray-700 dark:text-[#F1F5F9] hidden sm:block">
                {profile.state} · {profile.ageGroup}
                {profile.firstTimeVoter && (
                  <span className="ml-2 text-[#FF6B00] text-xs">✨ First Voter</span>
                )}
              </span>

              {/* Score pill */}
              <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-full px-3 py-1">
                <span className="text-xs font-bold text-[#FF6B00]">{score}</span>
                <span className="text-xs text-gray-400 dark:text-[#CBD5E1]">/ 100</span>
                <div className="w-14 h-1.5 bg-orange-100 dark:bg-orange-500/20 rounded-full overflow-hidden ml-1">
                  <motion.div
                    className="h-full bg-[#FF6B00] rounded-full"
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Stages completed */}
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-2.5 py-1">
                <span>{stagesCompleted}/{totalStages}</span>
                <span className="hidden sm:inline text-emerald-500 dark:text-emerald-600">stages</span>
              </div>

              {/* Cloud / local indicator */}
              <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-[#CBD5E1]">
                {firebaseUser ? (
                  <><Cloud className="w-3 h-3 text-green-500" /> <span className="hidden sm:inline">Cloud</span></>
                ) : (
                  <><HardDrive className="w-3 h-3 text-amber-400" /> <span className="hidden sm:inline">Local</span></>
                )}
              </div>
            </div>

          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {saveStatus === "saved" ? (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                </motion.span>
              ) : (
                  <motion.button
                  key="save-btn"
                  whileTap={{ scale: 0.95 }}
                  onClick={saveProgress}
                  disabled={saveStatus === "saving"}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-[#CBD5E1] hover:text-[#FF6B00] dark:hover:text-[#FF6B00] bg-gray-50 dark:bg-[#13223F] hover:bg-orange-50 dark:hover:bg-orange-500/10 border border-gray-200 dark:border-[#1e325c] hover:border-orange-200 dark:hover:border-orange-500/30 px-3 py-1.5 rounded-full transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saveStatus === "saving" ? "Saving…" : "Save to Cloud"}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Download Certificate (Only if 80%+ progress) */}
            {score >= 80 && (
              <button
                onClick={() => downloadCertificate({
                  name: firebaseUser?.displayName || "Jagruk Naagrik",
                  score,
                  stagesCompleted,
                  profileName: profile.state,
                  firstTimeVoter: profile.firstTimeVoter,
                })}
                className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E05500] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Certificate</span>
              </button>
            )}

            <button
              onClick={onReset}
              className="flex items-center gap-2 bg-white/80 hover:bg-white text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-gray-200 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Change Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-orange-200 hidden sm:block" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
              Official ECI Election Process
            </span>
            <div className="h-px w-8 bg-orange-200 hidden sm:block" />
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-[#F1F5F9] leading-tight mb-4"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            8 Stages of the <span className="gradient-text">Indian Election Process</span>
          </h2>
          <p className="text-gray-500 dark:text-[#CBD5E1] text-sm sm:text-base max-w-2xl mx-auto">
            Tap any stage to learn what happens, your role as a citizen, and mark it as understood.
          </p>
        </motion.div>

        {isGuest && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-[#F1F5F9]">Save Permanently</p>
              <p className="text-xs text-gray-500 dark:text-[#CBD5E1]">
                Login to sync your progress across all devices and earn verified badges.
              </p>
            </div>
            <button
              onClick={onOpenLogin}
              className="shrink-0 flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E05500] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors touch-target"
            >
              <LogIn className="w-4 h-4" /> Login / Sign Up
            </button>
          </div>
        )}

        <div>
          {STAGES.map((stage, i) => (
            <TimelineStage
              key={stage.id}
              stage={stage}
              stateContext={profile.state}
              isFirstTime={profile.firstTimeVoter}
              checkedItems={checkedItems}
              onToggleItem={handleToggle}
              index={i}
              isLast={i === STAGES.length - 1}
            />
          ))}
        </div>

      </div>

      {/* ── Celebration Modal ── */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        score={score}
        stagesCompleted={stagesCompleted}
        badgesEarned={unlockedBadges.length}
        profileName={profile.state}
        firstTimeVoter={profile.firstTimeVoter}
        userName={firebaseUser?.displayName || "Jagruk Naagrik"}
      />
    </motion.div>
  );
}
