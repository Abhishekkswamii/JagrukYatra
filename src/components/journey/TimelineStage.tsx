"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, CheckSquare, Square, Info, ExternalLink, MapPin
} from "lucide-react";
import type { TimelineStage as Stage } from "@/lib/journeyData";

interface Props {
  stage: Stage;
  stateContext: string;
  isFirstTime: boolean;
  checkedItems: string[];
  onToggleItem: (id: string) => void;
  index: number;
  isLast: boolean;
}

export default function TimelineStage({
  stage,
  stateContext,
  isFirstTime,
  checkedItems,
  onToggleItem,
  index,
  isLast,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const stageComplete = checkedItems.includes(stage.slug);
  const stateNote = stage.stateNote(stateContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="relative flex gap-4 sm:gap-6"
    >
      {/* Left: connector line + node */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg transition-all border-2 ${
            stageComplete
              ? "bg-emerald-500 border-emerald-400 shadow-emerald-200"
              : "bg-white dark:bg-card border-orange-200 dark:border-[#1e325c] shadow-orange-100 dark:shadow-[0_0_20px_rgba(255,103,31,0.05)]"
          }`}
        >
          {stageComplete ? "✅" : stage.icon}
          <div
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-sm"
            style={{ background: stage.accentColor }}
          >
            {stage.id}
          </div>
        </div>

        {!isLast && (
          <motion.div
            className="relative w-1 flex-1 mt-3 mb-3 rounded-full overflow-hidden"
          >
            {/* Background track */}
            <div className="absolute inset-0 bg-orange-100 dark:bg-orange-900/30 rounded-full" />
            {/* Green fill — animates to full height when complete */}
            <motion.div
              className="absolute inset-x-0 top-0 bg-green-400 dark:bg-green-500 rounded-full"
              initial={{ height: 0 }}
              animate={{ height: stageComplete ? "100%" : 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </div>

      {/* Right: Card */}
      <div className="flex-1 pb-8 sm:pb-12">
        <div
          className={`w-full bg-gradient-to-br ${stage.color} dark:from-card dark:to-background border rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-[0_0_30px_rgba(255,103,31,0.03)] transition-all ${
            stageComplete ? "border-emerald-300 dark:border-emerald-500/40" : "border-orange-200 dark:border-[#1e325c]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white shadow-sm"
                  style={{ backgroundColor: stage.accentColor }}
                >
                  Stage {stage.id}
                </span>
                {isFirstTime && stage.id === 2 && (
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full shadow-sm">
                    ✨ Start Here
                  </span>
                )}
              </div>
              <h3
                className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {stage.title}
              </h3>
              <p className="text-sm sm:text-base text-[#FF6B00] dark:text-orange-400 font-semibold mt-1">
                {stage.tagline}
              </p>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-4 leading-relaxed">
            {stage.summary}
          </p>

          {/* ── Official Resource Link — always visible ── */}
          {stage.link && (
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 ml-1">
                🏛️ Official Resource
              </p>
              <a
                href={stage.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-2.5
                  text-sm font-bold
                  text-[#FF6B00] dark:text-orange-400
                  bg-white dark:bg-[#13223F]
                  border-2 border-[#FF6B00]/30 dark:border-orange-500/30
                  hover:border-[#FF6B00] dark:hover:border-orange-400
                  hover:bg-orange-50 dark:hover:bg-orange-500/10
                  hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-200/60 dark:hover:shadow-orange-900/30
                  px-4 py-2.5 rounded-2xl
                  transition-all duration-200
                  group
                "
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#FF6B00]/10 dark:bg-orange-500/20 shrink-0">
                  <ExternalLink className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span>{stage.link.text}</span>
                <span className="text-[#FF6B00]/40 dark:text-orange-500/40 text-xs ml-auto pl-2">↗</span>
              </a>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Big Checkbox — primary CTA */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onToggleItem(stage.slug)}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl font-bold text-base sm:text-lg transition-all shadow-sm ${
                stageComplete
                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-500/50"
                  : "bg-white dark:bg-[#13223F] text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-[#FF6B00] hover:text-[#FF6B00] dark:hover:border-orange-500 active:scale-95"
              }`}
            >
              {stageComplete ? (
                <>
                  <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                  <span>Understood ✅</span>
                </>
              ) : (
                <>
                  <Square className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500 shrink-0" />
                  <span>Mark as Understood</span>
                </>
              )}
            </motion.button>

            {/* Learn More Toggle — secondary */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 flex items-center justify-center gap-2 text-sm font-semibold text-[#1A2C6B] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 px-4 py-4 sm:py-3 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>{expanded ? "Hide Details" : "More Info"}</span>
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>
          </div>

          {/* Expandable content — deeper details + state note only */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-5 mt-5 border-t border-gray-200 dark:border-gray-700/50 space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                    {stage.details}
                  </p>

                  {stateNote && (
                    <div className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-xl p-4">
                      <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                          {stateContext} — Specific Note
                        </p>
                        <p className="text-sm text-indigo-800 dark:text-indigo-400/80">{stateNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
