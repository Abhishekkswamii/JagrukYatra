"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import {
  Zap, Shield, ThumbsUp, ThumbsDown, Trophy, RotateCcw,
  ChevronRight, Sparkles, CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { addJagrukScore, markModuleComplete, awardBadge } from "@/lib/firestore";

/* ────────────────────────────────────────────
   Myths data — 8 myths with ECI references
──────────────────────────────────────────── */
const MYTHS = [
  {
    id: 1,
    statement: "My single vote doesn't make a difference in a country of 1.4 billion people.",
    isMyth: true,
    explanation: "In the 2009 Modakurichi constituency in Tamil Nadu, the margin of victory was just ONE vote. Many seats are won by margins under 1,000. Your vote ALWAYS counts.",
    reference: "ECI Election Results Archive",
    category: "Voting Process",
  },
  {
    id: 2,
    statement: "You need the original Voter ID (EPIC) card to cast your vote.",
    isMyth: true,
    explanation: "ECI allows 12 alternative photo IDs including Aadhaar, Passport, PAN Card, Driving License, and more. Any one valid photo ID is sufficient.",
    reference: "ECI Order No. 51/8/7/2015-EPS dated 2015",
    category: "Documents",
  },
  {
    id: 3,
    statement: "If NOTA gets the most votes in a constituency, the election is re-held.",
    isMyth: true,
    explanation: "NOTA only registers dissent. Even if NOTA gets the highest votes, the candidate with the next highest valid votes wins the seat.",
    reference: "Supreme Court — PUCL v. UOI (2013)",
    category: "NOTA",
  },
  {
    id: 4,
    statement: "EVM machines can be hacked or tampered with to change results.",
    isMyth: true,
    explanation: "Indian EVMs are standalone units with no wireless connectivity, no internet, and no operating system. They use one-time programmable chips burned at Bharat Electronics Limited. The VVPAT system provides a paper trail for verification.",
    reference: "ECI Technical Expert Committee Report, 2023",
    category: "EVM",
  },
  {
    id: 5,
    statement: "The Election Commission of India is a constitutional body established by the Constitution itself.",
    isMyth: false,
    explanation: "Correct! The ECI was established under Article 324 of the Indian Constitution. It is an autonomous constitutional authority responsible for administering election processes.",
    reference: "Article 324, Constitution of India",
    category: "Constitution",
  },
  {
    id: 6,
    statement: "You can vote from any polling station in your constituency even if it's not assigned to you.",
    isMyth: true,
    explanation: "You must vote at the polling station assigned to you as per the electoral roll. Your name appears only at your designated booth. Check booth details at nvsp.in.",
    reference: "Section 62, Representation of the People Act, 1951",
    category: "Voting Process",
  },
  {
    id: 7,
    statement: "NRIs (Non-Resident Indians) can vote in Indian elections if they are registered.",
    isMyth: false,
    explanation: "Correct! Since 2011, NRIs can register as overseas electors under Section 20A of the RP Act. They must be present in person at their assigned polling station to vote.",
    reference: "Section 20A, RP Act 1950 (Amendment 2010)",
    category: "Eligibility",
  },
  {
    id: 8,
    statement: "Political parties can see whom you voted for using the EVM serial number.",
    isMyth: true,
    explanation: "EVMs do not store any voter identity information. The machine records only the cumulative count per candidate. Individual votes cannot be traced back to any voter.",
    reference: "ECI FAQ on EVMs",
    category: "EVM",
  },
];

/* ─── Swipe card component ─── */
function MythCard({
  myth,
  onAnswer,
  index,
}: {
  myth: typeof MYTHS[0];
  onAnswer: (answer: "myth" | "fact") => void;
  index: number;
}) {
  const [swiping, setSwiping] = useState<"left" | "right" | null>(null);

  const handleSwipe = (direction: "left" | "right") => {
    setSwiping(direction);
    setTimeout(() => onAnswer(direction === "left" ? "myth" : "fact"), 350);
  };

  return (
    <motion.div
      key={myth.id}
      initial={{ scale: 0.9, opacity: 0, y: 30 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: 0,
        x: swiping === "left" ? -300 : swiping === "right" ? 300 : 0,
        rotate: swiping === "left" ? -15 : swiping === "right" ? 15 : 0,
      }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -80) handleSwipe("left");
        else if (info.offset.x > 80) handleSwipe("right");
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="h-full bg-white dark:bg-card border-2 border-orange-100 dark:border-[#1e325c] rounded-3xl shadow-lg shadow-orange-100/50 dark:shadow-[0_0_30px_rgba(255,103,31,0.05)] p-6 sm:p-8 flex flex-col transition-colors duration-300">
        {/* Category tag */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-navy-50 dark:bg-blue-900/20 text-[#1A2C6B] dark:text-blue-400 border border-[#1A2C6B]/20 dark:border-blue-400/20">
            <AlertTriangle className="w-3 h-3" />
            {myth.category}
          </span>
          <span className="text-xs font-semibold text-gray-400">#{index + 1} of {MYTHS.length}</span>
        </div>

        {/* Statement */}
        <div className="flex-1 flex items-center justify-center">
          <p
            className="text-lg sm:text-xl font-bold text-gray-900 dark:text-foreground text-center leading-relaxed"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            &ldquo;{myth.statement}&rdquo;
          </p>
        </div>

        {/* Swipe hints */}
        <div className="flex items-center justify-between mt-6 mb-3">
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
            <ThumbsDown className="w-4 h-4" /> ← MYTH
          </div>
          <div className="text-xs text-gray-300 dark:text-gray-600 font-medium">Swipe or tap</div>
          <div className="flex items-center gap-1.5 text-green-500 text-xs font-semibold">
            FACT → <ThumbsUp className="w-4 h-4" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSwipe("left")}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-300 dark:hover:border-red-500/40 transition-all active:scale-95"
          >
            <XCircle className="w-5 h-5" /> It&apos;s a Myth!
          </button>
          <button
            onClick={() => handleSwipe("right")}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 font-bold text-sm hover:bg-green-100 dark:hover:bg-green-500/20 hover:border-green-300 dark:hover:border-green-500/40 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" /> It&apos;s a Fact!
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Result overlay ─── */
function ResultOverlay({
  myth,
  correct,
  onNext,
}: {
  myth: typeof MYTHS[0];
  correct: boolean;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-10"
    >
      <div className={`h-full rounded-3xl p-6 sm:p-8 flex flex-col border-2 ${
        correct
          ? "bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30"
          : "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30"
      }`}>
        {/* Verdict */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            correct ? "bg-green-100 dark:bg-green-500/20" : "bg-red-100 dark:bg-red-500/20"
          }`}>
            {correct ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            )}
          </div>
          <div>
            <p className={`font-bold text-lg ${correct ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} style={{ fontFamily: "var(--font-poppins)" }}>
              {correct ? "Correct! 🎉" : "Not quite 😅"}
            </p>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              This statement is a{" "}
              <span className={`font-extrabold ${myth.isMyth ? "text-red-500 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {myth.isMyth ? "MYTH" : "FACT"}
              </span>
            </p>
          </div>
          {correct && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="ml-auto bg-[#FF6B00] text-white text-xs font-bold px-3 py-1 rounded-full"
            >
              +5 pts
            </motion.div>
          )}
        </div>

        {/* Explanation */}
        <div className="flex-1 overflow-auto">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{myth.explanation}</p>
          <div className="bg-white/70 dark:bg-black/20 rounded-xl px-4 py-2.5 border border-gray-200 dark:border-white/10">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-[#1A2C6B] dark:text-blue-400">📋 Reference:</span> {myth.reference}
            </p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="mt-4 w-full py-3 bg-[#FF6B00] hover:bg-[#E05500] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   Main Myth Buster Arena Section
════════════════════════════════════════════ */
export default function MythBusterSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const { firebaseUser, userDoc, refreshUserDoc } = useAuth();

  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleAnswer = useCallback(
    (answer: "myth" | "fact") => {
      const myth = MYTHS[currentIdx];
      const isCorrect =
        (answer === "myth" && myth.isMyth) || (answer === "fact" && !myth.isMyth);

      setLastCorrect(isCorrect);
      if (isCorrect) setCorrectCount((c) => c + 1);
      setAnswers((a) => [...a, isCorrect]);
      setShowResult(true);
    },
    [currentIdx]
  );

  const handleNext = useCallback(async () => {
    setShowResult(false);
    if (currentIdx + 1 < MYTHS.length) {
      setCurrentIdx((i) => i + 1);
    } else {
      setFinished(true);
      // Save to Firebase
      if (firebaseUser) {
        const finalCorrect = correctCount + (lastCorrect ? 0 : 0); // already counted
        const pts = finalCorrect * 5;
        try {
          await addJagrukScore(firebaseUser.uid, pts);
          await markModuleComplete(firebaseUser.uid, "myth-buster");
          if (finalCorrect >= 6) {
            await awardBadge(firebaseUser.uid, "myth-slayer");
          }
          await awardBadge(firebaseUser.uid, "fact-checker");
          await refreshUserDoc();
        } catch { /* not logged in or Firestore error */ }
      }
    }
  }, [currentIdx, firebaseUser, correctCount, lastCorrect, refreshUserDoc]);

  const reset = () => {
    setStarted(false);
    setCurrentIdx(0);
    setCorrectCount(0);
    setAnswers([]);
    setShowResult(false);
    setLastCorrect(false);
    setFinished(false);
  };

  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  return (
    <section id="myth-buster" className="py-24 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-[#020B1F] dark:via-[#020B1F] dark:to-[#020B1F] relative overflow-hidden transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-20 -left-32 w-64 h-64 rounded-full bg-orange-100/50 dark:bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-32 w-64 h-64 rounded-full bg-amber-100/50 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5" /> Myth Buster Arena
          </span>
          <h2
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-foreground mb-4"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Myth vs{" "}
            <span className="gradient-text">Fact</span>{" "}
            Arena ⚔️
          </h2>
          <p className="text-gray-500 dark:text-muted-foreground text-lg max-w-2xl mx-auto">
            Swipe your way through 8 common election statements. Can you tell myth from fact?
          </p>
        </motion.div>

        {/* Arena container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          {!started ? (
            /* ─── Start screen ─── */
            <div className="bg-white dark:bg-card border-2 border-orange-100 dark:border-[#1e325c] rounded-3xl shadow-lg shadow-orange-100/50 dark:shadow-[0_0_30px_rgba(255,103,31,0.05)] p-8 text-center transition-colors">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-amber-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-200 dark:shadow-orange-500/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3
                className="text-2xl font-extrabold text-gray-900 dark:text-foreground mb-2"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Ready to Enter the Arena?
              </h3>
              <p className="text-gray-500 dark:text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                You&apos;ll be shown 8 election-related statements. Classify each as a <span className="font-bold text-red-500 dark:text-red-400">Myth</span> or <span className="font-bold text-green-600 dark:text-green-400">Fact</span>. Earn <span className="font-bold text-[#FF6B00]">5 Jagruk Points</span> per correct answer!
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <div className="text-2xl font-extrabold text-[#FF6B00]">{MYTHS.length}</div>
                  <div className="text-xs text-gray-500">Statements</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <div className="text-2xl font-extrabold text-green-600">40</div>
                  <div className="text-xs text-gray-500">Max Points</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <div className="text-2xl font-extrabold text-purple-600">1</div>
                  <div className="text-xs text-gray-500">Badge</div>
                </div>
              </div>
              <button
                onClick={() => setStarted(true)}
                className="w-full py-4 bg-[#FF6B00] hover:bg-[#E05500] text-white font-bold rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-lg"
              >
                <Sparkles className="w-5 h-5" /> Enter the Arena
              </button>
            </div>
          ) : finished ? (
            /* ─── Final score ─── */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-card border-2 border-orange-100 dark:border-[#1e325c] rounded-3xl shadow-lg shadow-orange-100/50 dark:shadow-[0_0_30px_rgba(255,103,31,0.05)] p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-[#FF6B00] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-200"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h3
                className="text-2xl font-extrabold text-gray-900 dark:text-foreground mb-2"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {correctCount >= 7 ? "Outstanding! 🏆" : correctCount >= 5 ? "Well Done! 🎉" : "Good Try! 💪"}
              </h3>
              <p className="text-gray-500 dark:text-muted-foreground mb-6">
                You correctly identified{" "}
                <span className="font-extrabold text-[#FF6B00] text-2xl">{correctCount}</span>/{MYTHS.length} statements
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <div className="text-xl font-extrabold text-green-600">{correctCount}</div>
                  <div className="text-xs text-gray-500">Correct</div>
                </div>
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <div className="text-xl font-extrabold text-red-500">{MYTHS.length - correctCount}</div>
                  <div className="text-xs text-gray-500">Incorrect</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <div className="text-xl font-extrabold text-[#FF6B00]">{accuracy}%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
              </div>

              {/* Points earned */}
              <div className="bg-gradient-to-r from-[#FF6B00] to-amber-400 rounded-xl p-4 mb-6 text-white">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold text-lg">+{correctCount * 5} Jagruk Points Earned!</span>
                </div>
                {correctCount >= 6 && (
                  <p className="text-sm opacity-90 mt-1">🏅 Myth Slayer badge unlocked!</p>
                )}
              </div>

              {/* Answer review */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {answers.map((a, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full ${a ? "bg-green-400" : "bg-red-300"}`}
                    title={`#${i + 1}: ${a ? "Correct" : "Wrong"}`}
                  />
                ))}
              </div>

              <button
                onClick={reset}
                className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E05500] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
            </motion.div>
          ) : (
            /* ─── Game area ─── */
            <div>
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {MYTHS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i < currentIdx
                        ? answers[i]
                          ? "bg-green-400"
                          : "bg-red-300"
                        : i === currentIdx
                        ? "bg-[#FF6B00] scale-125"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Score bar */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-500 dark:text-muted-foreground">
                  {currentIdx + 1}/{MYTHS.length}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6B00]">
                  <Sparkles className="w-3.5 h-3.5" /> {correctCount * 5} pts
                </span>
              </div>

              {/* Card stack */}
              <div className="relative h-[380px] sm:h-[360px]">
                <AnimatePresence mode="wait">
                  {showResult ? (
                    <ResultOverlay
                      key={`result-${currentIdx}`}
                      myth={MYTHS[currentIdx]}
                      correct={lastCorrect}
                      onNext={handleNext}
                    />
                  ) : (
                    <MythCard
                      key={`card-${currentIdx}`}
                      myth={MYTHS[currentIdx]}
                      onAnswer={handleAnswer}
                      index={currentIdx}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
