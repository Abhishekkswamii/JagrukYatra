"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Trophy, RotateCcw, Clock, Star, CheckCircle2, XCircle,
  Sparkles, Brain, ChevronRight, BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { addJagrukScore, markModuleComplete, awardBadge } from "@/lib/firestore";

/* ────────────────────────────────────────────
   Questions — 10 across 4 categories
──────────────────────────────────────────── */
interface Question {
  id: number;
  category: "Voting Process" | "Constitution" | "ECI" | "Myths & Facts";
  q: string;
  options: string[];
  answer: number; // 0-indexed
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Constitution",
    q: "Which Article of the Indian Constitution guarantees the right to vote?",
    options: ["Article 19", "Article 326", "Article 21", "Article 14"],
    answer: 1,
    explanation: "Article 326 states that elections to the Lok Sabha and Legislative Assemblies shall be on the basis of adult suffrage — every citizen 18+ has the right to vote.",
    difficulty: "Easy",
  },
  {
    id: 2,
    category: "Voting Process",
    q: "What is the minimum age required to vote in Indian elections?",
    options: ["21 years", "25 years", "18 years", "16 years"],
    answer: 2,
    explanation: "The 61st Amendment Act (1988) lowered the voting age from 21 to 18 years, giving India one of the youngest electorate bases in the world.",
    difficulty: "Easy",
  },
  {
    id: 3,
    category: "ECI",
    q: "NOTA (None of the Above) option was introduced by the Supreme Court in which year?",
    options: ["2009", "2011", "2013", "2015"],
    answer: 2,
    explanation: "The Supreme Court of India, in PUCL vs Union of India (2013), directed ECI to include NOTA on EVMs, giving voters the right to reject all candidates.",
    difficulty: "Medium",
  },
  {
    id: 4,
    category: "ECI",
    q: "What is the Model Code of Conduct (MCC)?",
    options: [
      "A code for candidates to dress formally",
      "Guidelines for ethical behaviour during elections",
      "Rules for ballot paper design",
      "A model for school elections",
    ],
    answer: 1,
    explanation: "The MCC is a set of guidelines issued by ECI for political parties, candidates, and the government during elections to ensure free, fair, and peaceful elections.",
    difficulty: "Medium",
  },
  {
    id: 5,
    category: "Constitution",
    q: "Who appoints the Chief Election Commissioner of India?",
    options: ["Parliament", "Prime Minister", "President of India", "Supreme Court"],
    answer: 2,
    explanation: "Under Article 324(2), the President appoints the CEC and other Election Commissioners. Since 2023, a selection committee including PM, Leader of Opposition, and CJI recommends the appointment.",
    difficulty: "Medium",
  },
  {
    id: 6,
    category: "Voting Process",
    q: "What is VVPAT and what is its purpose?",
    options: [
      "Voter Verified Paper Audit Trail — provides a paper receipt to verify your vote",
      "Virtual Voting Application for Technology — an online voting system",
      "Voter Verification and Processing Terminal — for biometric scanning",
      "Valid Vote Acknowledgement Protocol — a counting method",
    ],
    answer: 0,
    explanation: "VVPAT is attached to EVMs and displays a printed slip of the voter's choice for 7 seconds before dropping into a sealed box — providing a verifiable paper trail.",
    difficulty: "Hard",
  },
  {
    id: 7,
    category: "Myths & Facts",
    q: "Can a voter be denied voting rights for having a criminal record?",
    options: [
      "Yes, any crime disqualifies you",
      "Only if convicted and serving a sentence",
      "Only for treason",
      "No, criminal record never affects voting rights",
    ],
    answer: 1,
    explanation: "Under Section 62(5) of the RP Act 1951, a person who is confined in prison or in lawful custody of the police cannot vote. But after release, full voting rights are restored.",
    difficulty: "Hard",
  },
  {
    id: 8,
    category: "ECI",
    q: "How many Lok Sabha constituencies are there in India?",
    options: ["435", "543", "545", "552"],
    answer: 1,
    explanation: "India has 543 Lok Sabha constituencies. 2 Anglo-Indian seats were abolished by the 104th Constitutional Amendment Act in 2020, but the 543 elected seats remain.",
    difficulty: "Easy",
  },
  {
    id: 9,
    category: "Voting Process",
    q: "What is Form 6 used for in the electoral process?",
    options: [
      "To file an election complaint",
      "To register as a new voter",
      "To request postal ballot",
      "To challenge election results",
    ],
    answer: 1,
    explanation: "Form 6 is the application form for new voter registration in India. It can be filed online at nvsp.in or at the nearest ERO (Electoral Registration Officer) office.",
    difficulty: "Medium",
  },
  {
    id: 10,
    category: "Myths & Facts",
    q: "In Indian elections, can a candidate contest from more than one constituency?",
    options: [
      "No, only one constituency allowed",
      "Yes, up to two constituencies",
      "Yes, unlimited constituencies",
      "Only if they are a sitting PM or CM",
    ],
    answer: 1,
    explanation: "Section 33(7) of the RP Act, 1951 allows a candidate to contest from a maximum of two constituencies. If they win both, they must vacate one within 14 days.",
    difficulty: "Hard",
  },
];

/* ─── Category colours ─── */
const CATEGORY_COLORS: Record<string, string> = {
  "Voting Process": "bg-blue-50 text-blue-700 border-blue-200",
  Constitution: "bg-purple-50 text-purple-700 border-purple-200",
  ECI: "bg-amber-50 text-amber-700 border-amber-200",
  "Myths & Facts": "bg-rose-50 text-rose-700 border-rose-200",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-green-600",
  Medium: "text-amber-600",
  Hard: "text-red-500",
};

/* ────────────────────────────────────────────
   Quiz Section Component
──────────────────────────────────────────── */
export default function QuizSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const { firebaseUser, refreshUserDoc } = useAuth();

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  /* Timer countdown */
  useEffect(() => {
    if (!timerActive || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setTimerActive(false);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive, timer]);

  const handleTimeout = useCallback(() => {
    if (selected !== null) return; // already answered
    setSelected(-1); // mark as timed out
    setAnswers((a) => [...a, false]);
    setShowExplanation(true);
    setStreak(0);
  }, [selected]);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimerActive(false);

    const isCorrect = idx === QUESTIONS[current].answer;
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        setMaxStreak((m) => Math.max(m, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    setAnswers((a) => [...a, isCorrect]);
    setShowExplanation(true);
  };

  const nextQuestion = async () => {
    setShowExplanation(false);
    setSelected(null);

    if (current + 1 < QUESTIONS.length) {
      setCurrent((c) => c + 1);
      setTimer(15);
      setTimerActive(true);
    } else {
      setDone(true);
      // Save to Firebase
      if (firebaseUser) {
        const pts = score * 4;
        try {
          await addJagrukScore(firebaseUser.uid, pts);
          await markModuleComplete(firebaseUser.uid, "quiz");
          if (score >= 8) {
            await awardBadge(firebaseUser.uid, "quiz-master");
          }
          await refreshUserDoc();
        } catch { /* not logged in */ }
      }
    }
  };

  const startQuiz = () => {
    setStarted(true);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setAnswers([]);
    setShowExplanation(false);
    setTimer(15);
    setTimerActive(true);
    setStreak(0);
    setMaxStreak(0);
  };

  const q = QUESTIONS[current];
  const timerPct = (timer / 15) * 100;
  const timerColor = timer > 8 ? "bg-green-400" : timer > 4 ? "bg-amber-400" : "bg-red-400";

  return (
    <section id="quiz" className="py-24 bg-white dark:bg-background relative overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6B00] via-amber-300 to-[#1A2C6B]" />
      <div className="absolute top-40 -right-40 w-80 h-80 rounded-full bg-orange-50 dark:bg-orange-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Brain className="w-3.5 h-3.5" /> Test Your Knowledge
          </span>
          <h2
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-foreground mb-4"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Voter <span className="gradient-text">Knowledge Quiz</span> 🧠
          </h2>
          <p className="text-gray-500 dark:text-muted-foreground text-lg max-w-2xl mx-auto">
            10 questions across 4 categories. 15 seconds per question. How well do you know your democratic rights?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {!started ? (
            /* ─── Start screen ─── */
            <div className="bg-white dark:bg-card border-2 border-orange-100 dark:border-[#1e325c] rounded-3xl shadow-lg shadow-orange-100/50 dark:shadow-[0_0_30px_rgba(255,103,31,0.05)] p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-200">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3
                className="text-2xl font-extrabold text-gray-900 dark:text-foreground mb-2"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Ready to Test Yourself?
              </h3>
              <p className="text-gray-500 dark:text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                10 questions. 15-second timer. Earn <span className="font-bold text-[#FF6B00]">4 Jagruk Points</span> per correct answer. Score 8+ to unlock the <span className="font-bold text-indigo-600 dark:text-indigo-400">Quiz Master</span> badge!
              </p>

              {/* Category preview */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {Object.entries(CATEGORY_COLORS).map(([cat, cls]) => (
                  <div key={cat} className={`px-3 py-2 rounded-xl border text-xs font-semibold ${cls}`}>
                    {cat}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-3 border border-orange-100 dark:border-[#1e325c]">
                  <div className="text-2xl font-extrabold text-[#FF6B00]">10</div>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground">Questions</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <div className="text-2xl font-extrabold text-green-600">40</div>
                  <div className="text-xs text-gray-500">Max Points</div>
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                  <div className="text-2xl font-extrabold text-indigo-600">15s</div>
                  <div className="text-xs text-gray-500">Per Question</div>
                </div>
              </div>

              <button
                onClick={startQuiz}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-lg"
              >
                <Sparkles className="w-5 h-5" /> Start Quiz
              </button>
            </div>
          ) : done ? (
            /* ─── Results screen ─── */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-card border-2 border-orange-100 dark:border-[#1e325c] rounded-3xl shadow-lg shadow-orange-100/50 dark:shadow-[0_0_30px_rgba(255,103,31,0.05)] overflow-hidden"
            >
              {/* Score header */}
              <div className={`p-8 text-center text-white ${
                score >= 8 ? "bg-gradient-to-r from-amber-400 to-[#FF6B00]" :
                score >= 5 ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
                "bg-gradient-to-r from-gray-500 to-gray-700"
              }`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4"
                >
                  <Trophy className="w-10 h-10 text-white" />
                </motion.div>
                <h3
                  className="text-3xl font-extrabold mb-1"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {score >= 8 ? "Outstanding! 🏆" : score >= 5 ? "Well Done! 🎉" : "Keep Learning! 💪"}
                </h3>
                <p className="text-white/80">
                  You scored{" "}
                  <span className="text-4xl font-extrabold">{score}</span>/{QUESTIONS.length}
                </p>
              </div>

              <div className="p-8">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                    <div className="text-xl font-extrabold text-green-600">{score}</div>
                    <div className="text-xs text-gray-500">Correct</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                    <div className="text-xl font-extrabold text-[#FF6B00]">{score * 4}</div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                    <div className="text-xl font-extrabold text-purple-600">{maxStreak}🔥</div>
                    <div className="text-xs text-gray-500">Best Streak</div>
                  </div>
                </div>

                {/* Badge unlock */}
                {score >= 8 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-center gap-3"
                  >
                    <span className="text-3xl">🧠</span>
                    <div>
                      <p className="font-bold text-indigo-800 text-sm">Quiz Master Badge Unlocked!</p>
                      <p className="text-xs text-indigo-600">You&apos;re truly an informed citizen</p>
                    </div>
                  </motion.div>
                )}

                {/* Answer review */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Review</p>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-6 pr-1">
                  {QUESTIONS.map((question, i) => (
                    <div
                      key={question.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
                        answers[i]
                          ? "bg-green-50 border border-green-100"
                          : "bg-red-50 border border-red-100"
                      }`}
                    >
                      {answers[i] ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <span className="text-gray-700 truncate flex-1">{question.q}</span>
                      <span className={`font-bold ${CATEGORY_COLORS[question.category].split(" ")[1]}`}>
                        {question.category}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startQuiz}
                  className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#E05500] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                >
                  <RotateCcw className="w-4 h-4" /> Retry Quiz
                </button>
              </div>
            </motion.div>
          ) : (
            /* ─── Question screen ─── */
            <div className="bg-white dark:bg-card border-2 border-orange-100 dark:border-[#1e325c] rounded-3xl shadow-lg shadow-orange-100/50 dark:shadow-[0_0_30px_rgba(255,103,31,0.05)] overflow-hidden">
              {/* Timer bar */}
              <div className="h-1.5 bg-gray-100">
                <motion.div
                  className={`h-full ${timerColor}`}
                  animate={{ width: `${timerPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="p-6 sm:p-8">
                {/* Top row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border ${CATEGORY_COLORS[q.category]}`}>
                      {q.category}
                    </span>
                    <span className={`text-xs font-bold ${DIFFICULTY_COLORS[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {streak >= 2 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs font-bold text-orange-500"
                      >
                        🔥 {streak} streak
                      </motion.span>
                    )}
                    <div className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${
                      timer <= 4 ? "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}>
                      <Clock className="w-3.5 h-3.5" /> {timer}s
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400">
                    Question {current + 1} of {QUESTIONS.length}
                  </span>
                  <span className="text-xs font-bold text-[#FF6B00]">
                    <Star className="w-3 h-3 inline" /> Score: {score}
                  </span>
                </div>
                <div className="h-1 bg-orange-100 rounded-full mb-6 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FF6B00] rounded-full"
                    animate={{ width: `${((current) / QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={q.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg sm:text-xl font-bold text-gray-900 dark:text-foreground mb-6 leading-snug min-h-[56px]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {q.q}
                  </motion.h3>
                </AnimatePresence>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {q.options.map((opt, idx) => {
                    let cls =
                      "w-full text-left px-5 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ";
                    if (selected === null) {
                      cls += "border-gray-200 dark:border-[#1e325c] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] hover:bg-orange-50 dark:hover:bg-orange-500/10 text-gray-700 dark:text-gray-300 active:scale-[0.98]";
                    } else if (idx === q.answer) {
                      cls += "border-green-400 dark:border-green-500/50 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400";
                    } else if (idx === selected) {
                      cls += "border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400";
                    } else {
                      cls += "border-gray-100 dark:border-[#13223F] text-gray-300 dark:text-gray-600";
                    }
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className={cls}
                        onClick={() => handleAnswer(idx)}
                        disabled={selected !== null}
                      >
                        <span className="mr-2 font-bold text-[#FF6B00]">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {opt}
                        {selected !== null && idx === q.answer && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 inline ml-2" />
                        )}
                        {selected === idx && idx !== q.answer && (
                          <XCircle className="w-4 h-4 text-red-400 inline ml-2" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Timeout indicator */}
                {selected === -1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-4"
                  >
                    <Clock className="w-4 h-4" /> Time&apos;s up! The correct answer is highlighted above.
                  </motion.div>
                )}

                {/* Explanation */}
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`p-4 rounded-xl border-2 mb-4 ${
                        selected !== null && selected >= 0 && selected === q.answer
                          ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20"
                          : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                      }`}>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          <span className="font-bold">💡 </span>
                          {q.explanation}
                        </p>
                      </div>
                      <button
                        onClick={nextQuestion}
                        className="w-full py-3 bg-[#FF6B00] hover:bg-[#E05500] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                      >
                        {current + 1 < QUESTIONS.length ? (
                          <>Next Question <ChevronRight className="w-4 h-4" /></>
                        ) : (
                          <>See Results <Trophy className="w-4 h-4" /></>
                        )}
                      </button>
                    </motion.div>
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
