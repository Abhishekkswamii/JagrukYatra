"use client";

import { motion } from "framer-motion";

interface Props {
  score: number;
  totalChecked: number;
  totalItems: number;
  stagesCompleted: number;
}

const getScoreLabel = (score: number) => {
  if (score === 0) return { label: "Starting Out", color: "text-gray-400" };
  if (score < 25) return { label: "Curious Naagrik", color: "text-orange-500" };
  if (score < 50) return { label: "Aware Voter", color: "text-amber-500" };
  if (score < 75) return { label: "Informed Citizen", color: "text-blue-600" };
  if (score < 100) return { label: "Democracy Champion", color: "text-purple-600" };
  return { label: "Jagruk Naagrik", color: "text-emerald-600" };
};

export default function JagrukScore({ score, totalChecked, totalItems, stagesCompleted }: Props) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const strokeDash = circ - (score / 100) * circ;
  const { label, color } = getScoreLabel(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-50 p-6"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Ring */}
        <div className="relative w-36 h-36 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            {/* Track */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="#FFF0E6"
              strokeWidth="10"
            />
            {/* Progress */}
            <motion.circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: strokeDash }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B00" />
                <stop offset="100%" stopColor="#FFB347" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={score}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-extrabold text-gray-900"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {score}
            </motion.span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Score</span>
          </div>
        </div>

        {/* Info */}
        <div className="text-center sm:text-left flex-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Jagruk Score
          </div>
          <div
            className={`text-2xl font-extrabold mb-3 ${color}`}
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {label}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 rounded-xl px-3 py-2 text-center">
              <div className="text-xl font-bold text-[#FF6B00]" style={{ fontFamily: "var(--font-poppins)" }}>
                {stagesCompleted}<span className="text-sm text-gray-400">/8</span>
              </div>
              <div className="text-xs text-gray-500">Stages Done</div>
            </div>
            <div className="bg-blue-50 rounded-xl px-3 py-2 text-center">
              <div className="text-xl font-bold text-[#1A2C6B]" style={{ fontFamily: "var(--font-poppins)" }}>
                {totalChecked}<span className="text-sm text-gray-400">/{totalItems}</span>
              </div>
              <div className="text-xs text-gray-500">Tasks Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Journey Progress</span>
          <span>{score}% complete</span>
        </div>
        <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #FF6B00, #FFB347)" }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
