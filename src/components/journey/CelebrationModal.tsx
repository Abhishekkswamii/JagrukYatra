"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactConfetti from "react-confetti";
import { Trophy, X, Share2, Download, Heart, Star } from "lucide-react";
import { downloadCertificate } from "@/lib/certificateUtils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  stagesCompleted: number;
  badgesEarned: number;
  profileName?: string;
  firstTimeVoter: boolean;
  userName?: string;
}

const CONFETTI_COLORS = [
  "#FF671F", "#FF8C38", "#FFA366",
  "#FFD700", "#FFC200",
  "#046A38", "#138808",
  "#000080", "#0047A0",
  "#FFFFFF",
];

export default function CelebrationModal({
  isOpen,
  onClose,
  score,
  stagesCompleted,
  badgesEarned,
  profileName,
  firstTimeVoter,
  userName,
}: Props) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const update = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 6500);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleShare = () => {
    const text = `🇮🇳 I just completed my JagrukYatra! My Jagruk Score is ${score}/100. I now understand all ${stagesCompleted} stages of India's democratic process! #JagrukNaagrik #JagrukYatra`;
    if (navigator.share) {
      navigator.share({ title: "My JagrukYatra 🇮🇳", text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    await downloadCertificate({
      name: userName || "Jagruk Naagrik",
      score,
      stagesCompleted,
      profileName,
      firstTimeVoter,
    });
    setDownloading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti */}
          {showConfetti && (
            <div className="fixed inset-0 z-[999] pointer-events-none">
              <ReactConfetti
                width={windowSize.width}
                height={windowSize.height}
                colors={CONFETTI_COLORS}
                numberOfPieces={350}
                gravity={0.16}
                wind={0.008}
                recycle={false}
              />
            </div>
          )}

          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.88, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.28 }}
              className="pointer-events-auto w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-[0_32px_80px_rgba(255,103,31,0.18),0_8px_32px_rgba(0,0,0,0.08)] border border-orange-100">

                {/* Tricolour top stripe */}
                <div className="flex h-1.5">
                  <div className="flex-1 bg-[#FF671F]" />
                  <div className="flex-1 bg-white border-y border-orange-100" />
                  <div className="flex-1 bg-[#046A38]" />
                </div>

                {/* Subtle hero gradient */}
                <div
                  className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, #FFF3E8 0%, #FFFFFF 100%)",
                  }}
                />

                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-orange-50 opacity-60 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
                <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-blue-50 opacity-40 -translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative px-7 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-8 text-center max-h-[88vh] overflow-y-auto">

                  {/* Trophy */}
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.15, bounce: 0.5 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #FF671F 0%, #FFD700 100%)",
                      boxShadow: "0 8px 32px rgba(255,103,31,0.35)",
                    }}
                  >
                    <Trophy className="w-10 h-10 text-white drop-shadow" />
                  </motion.div>

                  {/* Heading */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-[#FF671F] mb-2">
                      🇮🇳 Jagruk Naagrik
                    </p>
                    <h2
                      className="text-2xl sm:text-3xl font-extrabold text-[#1A2C6B] leading-tight mb-3"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      You are the democracy
                      <br />
                      <span
                        style={{
                          background: "linear-gradient(90deg, #FF671F, #FFD700)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        India deserves
                      </span>
                    </h2>
                  </motion.div>

                  {/* Body text */}
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    className="text-gray-500 text-sm sm:text-base leading-relaxed mb-7 max-w-xs mx-auto"
                  >
                    {firstTimeVoter
                      ? `Amazing! As a first-time voter${profileName ? ` from ${profileName}` : ""}, you've understood the complete arc of India's democratic process. Your vote will make history.`
                      : `You've completed your JagrukYatra${profileName ? ` as a voter from ${profileName}` : ""}. Your informed vote is the most powerful force in Indian democracy.`}
                  </motion.p>

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42, duration: 0.4 }}
                    className="flex items-stretch justify-center gap-0 mb-7 rounded-2xl overflow-hidden border border-orange-100 bg-orange-50/40 divide-x divide-orange-100"
                  >
                    {/* Score */}
                    <div className="flex-1 py-4 px-3 text-center">
                      <div
                        className="text-3xl sm:text-4xl font-extrabold"
                        style={{
                          fontFamily: "var(--font-poppins)",
                          background: "linear-gradient(135deg, #FF671F, #FFD700)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {score}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        Jagruk Score
                      </div>
                      <div className="text-[10px] text-gray-300">/ 100</div>
                    </div>

                    {/* Stages */}
                    <div className="flex-1 py-4 px-3 text-center">
                      {/* Dot progress */}
                      <div className="flex items-center justify-center gap-0.5 mb-1 flex-wrap">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < stagesCompleted
                                ? "bg-emerald-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div
                        className="text-3xl sm:text-4xl font-extrabold text-emerald-600"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {stagesCompleted}/8
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        Stages Done
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex-1 py-4 px-3 text-center">
                      <div className="flex justify-center mb-1">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      </div>
                      <div
                        className="text-3xl sm:text-4xl font-extrabold text-amber-500"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {badgesEarned}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        Badges
                      </div>
                    </div>
                  </motion.div>

                  {/* Progress bar */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                  >
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, #FF671F 0%, #FFD700 50%, #046A38 100%)",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ delay: 0.65, duration: 0.9, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 text-center">
                      Jagruk Score — {score} / 100
                    </p>
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.4 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Share — primary saffron */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleShare}
                      className="w-full flex items-center justify-center gap-2.5 text-white font-bold py-3.5 rounded-2xl text-sm sm:text-base transition-all shadow-md"
                      style={{
                        background:
                          "linear-gradient(135deg, #FF671F 0%, #FF9900 100%)",
                        boxShadow: "0 4px 20px rgba(255,103,31,0.35)",
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share Your Yatra →
                    </motion.button>

                    {/* Download Certificate — gold */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full flex items-center justify-center gap-2.5 font-bold py-3.5 rounded-2xl text-sm sm:text-base transition-all shadow-md disabled:opacity-60"
                      style={{
                        background:
                          "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        color: "#1A2C6B",
                        boxShadow: "0 4px 20px rgba(255,215,0,0.35)",
                      }}
                    >
                      <Download className="w-4 h-4" />
                      {downloading ? "Generating..." : "Download Certificate"}
                    </motion.button>

                    {/* Dismiss */}
                    <button
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 font-semibold py-3 rounded-2xl text-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      Continue My Yatra
                    </button>
                  </motion.div>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-300">
                    <span className="text-[#FF671F]">■</span>
                    <span>Jai Hind — JagrukYatra</span>
                    <span className="text-[#046A38]">■</span>
                  </div>
                </div>

                {/* Tricolour bottom stripe */}
                <div className="flex h-1.5">
                  <div className="flex-1 bg-[#FF671F]" />
                  <div className="flex-1 bg-white border-y border-orange-100" />
                  <div className="flex-1 bg-[#046A38]" />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
