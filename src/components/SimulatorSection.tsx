"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  LogIn, IdCard, Fingerprint, Vote, Receipt, LogOut,
  ChevronRight, Trophy, RotateCcw, Star, Lightbulb, Zap
} from "lucide-react";
import EVMSimulator from "@/components/simulator/EVMSimulator";
import ScenarioExplorer from "@/components/simulator/ScenarioExplorer";

/* ─── Step definitions ─── */
const STEPS = [
  {
    id: 0,
    icon: LogIn,
    label: "Enter Booth",
    color: "#FF6B00",
    bg: "from-orange-500 to-amber-500",
    title: "Welcome to the Polling Booth",
    subtitle: "Step inside and begin your democratic journey",
    tip: "Polling booths are set up within 2 km of every voter's home in India.",
    cta: "Enter the Booth →",
    illustration: "🏛️",
  },
  {
    id: 1,
    icon: IdCard,
    label: "Show Voter ID",
    color: "#3b82f6",
    bg: "from-blue-500 to-indigo-500",
    title: "Verify Your Identity",
    subtitle: "Show your EPIC card or any valid photo ID",
    tip: "12 alternative IDs are accepted if you don't have your Voter ID card.",
    cta: "ID Verified — Proceed →",
    illustration: "🪪",
  },
  {
    id: 2,
    icon: Fingerprint,
    label: "Get Inked",
    color: "#8b5cf6",
    bg: "from-violet-500 to-purple-600",
    title: "Indelible Ink on Your Finger",
    subtitle: "Your left index finger gets marked — proof you've voted",
    tip: "The ink used is made from silver nitrate and is visible for weeks. It's impossible to wash off!",
    cta: "Inked! Let's Vote →",
    illustration: "☝️",
  },
  {
    id: 3,
    icon: Vote,
    label: "Cast Your Vote",
    color: "#10b981",
    bg: "from-emerald-500 to-teal-500",
    title: "Use the EVM to Vote",
    subtitle: "Press the button next to your chosen candidate",
    tip: "India's EVM is standalone, not connected to any network — making it tamper-proof.",
    cta: null,
    illustration: "🗳️",
  },
  {
    id: 4,
    icon: Receipt,
    label: "Verify VVPAT",
    color: "#f59e0b",
    bg: "from-amber-500 to-orange-500",
    title: "VVPAT Confirmation",
    subtitle: "A paper slip shows your candidate's name for 7 seconds",
    tip: "VVPAT stands for Voter Verifiable Paper Audit Trail — introduced in 2013.",
    cta: "Verified! Exit Now →",
    illustration: "🧾",
  },
  {
    id: 5,
    icon: LogOut,
    label: "Exit Booth",
    color: "#FF6B00",
    bg: "from-orange-500 to-rose-500",
    title: "🎉 You've Voted!",
    subtitle: "You've completed the full polling booth experience",
    tip: "You can share your inked finger on social media to encourage others to vote!",
    cta: null,
    illustration: "🎊",
  },
];

const funFacts = [
  "India holds the world's largest election — over 96 crore registered voters!",
  "The first general election (1951-52) took 4 months to complete.",
  "Over 5,500 candidates contest in a typical Lok Sabha election.",
  "ECI deploys over 1 crore polling personnel for each general election.",
  "The blue ink on your finger is made by Mysore Paints — a monopoly since 1962.",
];

/* ─── Ink animation component ─── */
function InkAnimation() {
  const [inked, setInked] = useState(false);
  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="relative">
        {/* Hand */}
        <svg viewBox="0 0 120 180" className="w-32 h-48 drop-shadow-lg">
          <ellipse cx="60" cy="155" rx="42" ry="22" fill="#f5d0a9" />
          {/* Thumb */}
          <ellipse cx="18" cy="130" rx="10" ry="24" fill="#f5d0a9" transform="rotate(-20 18 130)" />
          {/* Index */}
          <rect x="30" y="55" width="18" height="75" rx="9" fill="#f5d0a9" />
          {/* Middle */}
          <rect x="50" y="48" width="18" height="82" rx="9" fill="#f5d0a9" />
          {/* Ring */}
          <rect x="70" y="55" width="16" height="75" rx="8" fill="#f5d0a9" />
          {/* Pinky */}
          <rect x="88" y="68" width="14" height="62" rx="7" fill="#f5d0a9" />
          {/* Ink mark on index finger */}
          {inked && (
            <motion.ellipse
              cx="39" cy="63" rx="7" ry="4"
              fill="#1a237e"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
            />
          )}
        </svg>

        {/* Ink bottle illustration */}
        {!inked && (
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -top-4 right-0 text-4xl"
          >
            🖊️
          </motion.div>
        )}
      </div>

      {!inked ? (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setInked(true)}
          className="px-6 py-3 bg-[#1a237e] text-white rounded-xl font-semibold text-sm shadow-lg hover:bg-[#283593] transition-colors"
        >
          Apply Indelible Ink 🖋️
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-violet-700 font-bold text-base">✅ Ink Applied!</p>
          <p className="text-gray-500 text-sm mt-1">Your vote is now official</p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Voter ID input ─── */
function VoterIDStep() {
  const [epic, setEpic] = useState("");
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    if (epic.length >= 6) setVerified(true);
  };

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="text-6xl">🪪</div>
      {!verified ? (
        <div className="w-full max-w-xs space-y-3">
          <p className="text-sm text-gray-600 text-center">Enter your EPIC Number (mock)</p>
          <input
            type="text"
            value={epic}
            onChange={(e) => setEpic(e.target.value.toUpperCase())}
            placeholder="e.g. MH/01/234/567890"
            maxLength={18}
            className="w-full px-4 py-3 border-2 border-orange-200 dark:border-[#1e325c] rounded-xl text-sm font-mono focus:outline-none focus:border-[#FF6B00] dark:focus:border-[#FF6B00] bg-transparent dark:text-foreground transition-colors text-center tracking-widest"
          />
          <button
            onClick={handleVerify}
            disabled={epic.length < 6}
            className="w-full py-2.5 bg-[#FF6B00] text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E05500] transition-colors"
          >
            Verify ID
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/20 rounded-2xl px-8 py-5"
        >
          <p className="text-green-700 dark:text-green-400 font-bold text-lg">✅ Identity Verified!</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-mono">{epic}</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Name found in Voter Roll</p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Step content renderer ─── */
function StepContent({
  step,
  onVoteComplete,
}: {
  step: (typeof STEPS)[0];
  onVoteComplete: () => void;
}) {
  if (step.id === 1) return <VoterIDStep />;
  if (step.id === 2) return <InkAnimation />;
  if (step.id === 3) return <EVMSimulator onVoteComplete={onVoteComplete} />;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-7xl"
      >
        {step.illustration}
      </motion.div>
      <p className="text-gray-500 dark:text-muted-foreground text-sm text-center max-w-xs">{step.subtitle}</p>
    </div>
  );
}

/* ─── Main Simulator Section ─── */
export default function SimulatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const [activeTab, setActiveTab] = useState<"booth" | "scenarios">("booth");
  const [step, setStep] = useState(0);
  const [voteComplete, setVoteComplete] = useState(false);
  const [simulationDone, setSimulationDone] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  const currentStep = STEPS[step];

  const handleNext = () => {
    if (step === 3 && !voteComplete) return; // Must vote first
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      setFactIndex((i) => (i + 1) % funFacts.length);
      if (step === STEPS.length - 2) setSimulationDone(true);
    }
  };

  const handleReset = () => {
    setStep(0);
    setVoteComplete(false);
    setSimulationDone(false);
    setFactIndex(0);
  };

  const canProceed = step !== 3 || voteComplete;

  return (
    <section id="simulator" className="py-24 bg-gradient-to-b from-orange-50/40 via-white to-white dark:from-[#020B1F] dark:via-[#020B1F] dark:to-[#020B1F] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-[#FF6B00] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <Zap className="w-3 h-3" />
            Interactive Experience
          </span>
          <h2
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-foreground mb-4"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Election <span className="gradient-text">Simulator</span>
          </h2>
          <p className="text-gray-500 dark:text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience democracy in action — walk through a real Indian polling booth, cast your vote on an EVM, and explore what-if scenarios.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-[#1e325c] rounded-2xl p-1 gap-1">
            {[
              { id: "booth", label: "🏛️ Virtual Polling Booth" },
              { id: "scenarios", label: "🔍 What-If Explorer" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "booth" | "scenarios")}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-[#FF6B00] text-white shadow-md shadow-orange-200 dark:shadow-[0_0_20px_rgba(255,103,31,0.2)]"
                    : "text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] dark:hover:text-[#FF6B00]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── POLLING BOOTH SIMULATOR ── */}
          {activeTab === "booth" && (
            <motion.div
              key="booth"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left — Step Tracker */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-card border border-orange-100 dark:border-[#1e325c] rounded-3xl p-6 shadow-sm dark:shadow-[0_0_30px_rgba(255,103,31,0.03)] sticky top-24">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Your Progress</p>
                  <div className="space-y-1">
                    {STEPS.map((s, i) => {
                      const Icon = s.icon;
                      const done = i < step;
                      const active = i === step;
                      return (
                        <div key={s.id} className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <motion.div
                              animate={
                                active
                                  ? { scale: [1, 1.1, 1], boxShadow: ["0 0 0 0px rgba(255,107,0,0)", "0 0 0 6px rgba(255,107,0,0.2)", "0 0 0 0px rgba(255,107,0,0)"] }
                                  : {}
                              }
                              transition={{ repeat: Infinity, duration: 1.8 }}
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                done
                                  ? "bg-green-500 text-white"
                                  : active
                                  ? "bg-[#FF6B00] text-white shadow-md shadow-orange-200"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {done ? "✓" : <Icon className="w-4 h-4" />}
                            </motion.div>
                            {i < STEPS.length - 1 && (
                              <div className={`w-0.5 h-6 my-0.5 transition-colors duration-500 ${done ? "bg-green-400" : "bg-gray-200 dark:bg-white/10"}`} />
                            )}
                          </div>
                          <div className={`pb-5 transition-all duration-300 ${active ? "opacity-100" : done ? "opacity-60" : "opacity-30"}`}>
                            <p className={`text-sm font-semibold ${active ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>{s.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {simulationDone && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-4 text-center"
                    >
                      <Trophy className="w-8 h-8 text-[#FF6B00] mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">+50 Jagruk Points!</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Simulation Complete</p>
                    </motion.div>
                  )}

                  {step > 0 && (
                    <button
                      onClick={handleReset}
                      className="mt-4 w-full flex items-center justify-center gap-2 text-gray-400 hover:text-[#FF6B00] text-xs font-medium transition-colors py-2"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Simulation
                    </button>
                  )}
                </div>
              </div>

              {/* Right — Main Stage */}
              <div className="lg:col-span-2 space-y-5">
                {/* Step Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="bg-white dark:bg-card border border-orange-100 dark:border-[#1e325c] rounded-3xl overflow-hidden shadow-md dark:shadow-[0_0_30px_rgba(255,103,31,0.05)]"
                  >
                    {/* Gradient header bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${currentStep.bg}`} />

                    {/* Step Header */}
                    <div className="px-6 pt-6 pb-2">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full text-white"
                          style={{ background: currentStep.color }}
                        >
                          Step {step + 1} of {STEPS.length}
                        </span>
                        {step === STEPS.length - 1 && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                            ✅ Complete!
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-2xl font-extrabold text-gray-900 dark:text-foreground mt-2"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {currentStep.title}
                      </h3>
                    </div>

                    {/* Interactive content */}
                    <div className="px-6 pb-2">
                      <StepContent
                        step={currentStep}
                        onVoteComplete={() => {
                          setVoteComplete(true);
                          setTimeout(() => setStep(4), 4000);
                        }}
                      />
                    </div>

                    {/* CTA Footer */}
                    {currentStep.cta && step < STEPS.length - 1 && (
                      <div className="px-6 pb-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleNext}
                          disabled={!canProceed}
                          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                            canProceed
                              ? "bg-[#FF6B00] hover:bg-[#E05500] text-white shadow-lg shadow-orange-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {currentStep.cta}
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}

                    {step === STEPS.length - 1 && (
                      <div className="px-6 pb-6">
                        <button
                          onClick={handleReset}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-[#FF6B00] text-[#FF6B00] font-bold text-sm hover:bg-orange-50 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" /> Experience Again
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Fun Fact */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={factIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4"
                  >
                    <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">Did You Know?</p>
                      <p className="text-sm text-amber-800 dark:text-amber-200">{funFacts[factIndex]}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Tip from current step */}
                <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4">
                  <Star className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-0.5">Booth Tip</p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{currentStep.tip}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SCENARIO EXPLORER ── */}
          {activeTab === "scenarios" && (
            <motion.div
              key="scenarios"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-8">
                <h3
                  className="text-2xl font-extrabold text-gray-900 dark:text-foreground mb-2"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  What-If <span className="gradient-text">Scenario Explorer</span>
                </h3>
                <p className="text-gray-500 dark:text-muted-foreground text-sm">
                  Click any scenario to get a detailed, easy-to-understand explanation and step-by-step solution.
                </p>
              </div>
              <ScenarioExplorer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
