"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy, Star, BookOpen, Cpu, HelpCircle, Zap, LogOut,
  MapPin, User, Calendar, Award, CheckCircle2, Lock, Trash2,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { BADGES, countValidStages } from "@/lib/journeyData";
import { downloadCertificate } from "@/lib/certificateUtils";
import DeleteAccountModal from "@/components/profile/DeleteAccountModal";

/* ─── Score ring ─── */
function ScoreRing({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min(score / max, 1);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#ffe0c8" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FFB347" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-extrabold gradient-text" style={{ fontFamily: "var(--font-poppins)" }}>
          {score}
        </div>
        <div className="text-xs text-gray-400 font-medium">Jagruk Pts</div>
      </div>
    </div>
  );
}

/* ─── Module card ─── */
const MODULES = [
  { id: "my-journey", label: "My Journey", icon: BookOpen, pts: 100, href: "/my-journey" },
  { id: "simulator", label: "Simulator", icon: Cpu, pts: 50, href: "/simulator" },
  { id: "myth-buster", label: "Myth Buster", icon: Zap, pts: 30, href: "/myth-buster" },
  { id: "quiz", label: "Quiz", icon: HelpCircle, pts: 40, href: "/quiz" },
];

/* ─── Main Profile page ─── */
export default function ProfilePage() {
  const { firebaseUser, userDoc, loading, logOut } = useAuth();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/");
    }
  }, [loading, firebaseUser, router]);

  if (loading || !userDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-saffron animate-pulse mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your Yatra…</p>
        </div>
      </div>
    );
  }

  const earnedBadges = BADGES.filter((b) => userDoc.earnedBadges.includes(b.id));
  const lockedBadges = BADGES.filter((b) => !userDoc.earnedBadges.includes(b.id));
  const completedCount = userDoc.completedModules.length;
  const totalModules = MODULES.length;
  const stagesDone = countValidStages(userDoc.completedChecklist);

  return (
    <>
      <Navbar />
      <main className="min-h-screen gradient-hero pt-20 pb-16">
        {/* Tricolour top strip */}
        <div className="fixed top-0 left-0 right-0 h-1 flex z-40 pointer-events-none">
          <div className="flex-1 bg-[#FF6B00]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#1A2C6B]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* ── Hero card ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl border border-orange-100 shadow-md overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-[#FF6B00] via-amber-300 to-[#1A2C6B]" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {firebaseUser?.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={firebaseUser.photoURL}
                      alt={userDoc.displayName}
                      className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl gradient-saffron flex items-center justify-center shadow-lg">
                      <span className="text-4xl font-extrabold text-white">
                        {userDoc.displayName?.[0]?.toUpperCase() ?? "V"}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white" />
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold text-gray-900"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {userDoc.displayName}
                  </h1>
                  <p className="text-gray-500 text-sm mt-0.5">{userDoc.email}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                    {userDoc.state && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
                        <MapPin className="w-3 h-3" /> {userDoc.state}
                      </span>
                    )}
                    {userDoc.ageGroup && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full">
                        <Calendar className="w-3 h-3" /> {userDoc.ageGroup}
                      </span>
                    )}
                    {userDoc.isFirstTimeVoter && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">
                        🌱 First-time Voter
                      </span>
                    )}
                  </div>
                </div>

                {/* Score ring */}
                <div className="flex-shrink-0">
                  <ScoreRing score={userDoc.jagrukScore} />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-gray-600">Overall Progress</p>
                  <p className="text-sm font-bold text-[#FF6B00]">{completedCount}/{totalModules} modules</p>
                </div>
                <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / totalModules) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center sm:justify-start gap-6">
                <button
                  onClick={logOut}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 text-sm text-red-300 hover:text-red-500 font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Stats row ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: "Jagruk Score", value: `${userDoc.jagrukScore}/100`, icon: Star, color: "text-[#FF6B00]", bg: "bg-orange-50" },
              { label: "Badges Earned", value: earnedBadges.length, icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Stages Done", value: `${stagesDone}/8`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
              { label: "Checklist Ticks", value: userDoc.completedChecklist.length, icon: User, color: "text-blue-600", bg: "bg-blue-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-2`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* ── Certificate CTA + Share ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="bg-gradient-to-r from-[#FF6B00] to-amber-400 rounded-3xl p-6 shadow-lg shadow-orange-200 flex flex-col sm:flex-row items-center gap-5"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-poppins)" }}>
                Get Your Certificate 🏆
              </h3>
              <p className="text-white/80 text-sm mt-0.5">
                Download or share your JagrukYatra completion certificate
              </p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <button
                onClick={() => downloadCertificate({
                  name: userDoc.displayName || "Jagruk Naagrik",
                  score: userDoc.jagrukScore,
                  stagesCompleted: countValidStages(userDoc.completedChecklist),
                  profileName: userDoc.state,
                  firstTimeVoter: userDoc.isFirstTimeVoter,
                })}
                className="px-6 py-2.5 bg-white text-[#FF6B00] font-bold text-sm rounded-xl hover:bg-orange-50 transition-all active:scale-95 shadow-sm"
              >
                Download Certificate
              </button>
              <button
                onClick={async () => {
                  const text = `🇮🇳 I scored ${userDoc.jagrukScore} Jagruk Points on JagrukYatra — the Election Awareness Journey!\n\n🏅 ${earnedBadges.length} badges earned | ${completedCount}/${totalModules} modules completed\n\nStart your Yatra → https://jagrukyatra.vercel.app`;
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: "My JagrukYatra Progress", text });
                    } else {
                      await navigator.clipboard.writeText(text);
                      alert("Progress copied to clipboard!");
                    }
                  } catch { /* cancelled */ }
                }}
                className="px-5 py-2.5 bg-white/20 text-white font-bold text-sm rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30"
              >
                Share Progress
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Badges ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="bg-white border border-orange-100 rounded-3xl shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <Trophy className="w-5 h-5 text-[#FF6B00]" />
                <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
                  Your Badges
                </h2>
              </div>

              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {earnedBadges.map((badge) => (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${badge.color}`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{badge.title}</p>
                        <p className="text-[10px] opacity-70 truncate">{badge.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No badges yet — complete modules to earn them!</p>
              )}

              {/* Locked */}
              {lockedBadges.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Locked</p>
                  <div className="grid grid-cols-2 gap-3">
                    {lockedBadges.map((badge) => (
                      <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 opacity-50">
                        <Lock className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-500 truncate">{badge.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* ── Modules ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45 }}
              className="bg-white border border-orange-100 rounded-3xl shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 className="w-5 h-5 text-[#FF6B00]" />
                <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
                  Module Progress
                </h2>
              </div>
              <div className="space-y-3">
                {MODULES.map((mod) => {
                  const done = userDoc.completedModules.includes(mod.id);
                  const Icon = mod.icon;
                  return (
                    <Link
                      key={mod.id}
                      href={mod.href}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:border-orange-200 hover:bg-orange-50 group"
                      style={{ borderColor: done ? "#22c55e" : "#ffe0c8", background: done ? "#f0fdf4" : undefined }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${done ? "bg-green-100" : "bg-orange-100"}`}>
                        <Icon className={`w-5 h-5 ${done ? "text-green-600" : "text-[#FF6B00]"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{mod.label}</p>
                        <p className="text-xs text-gray-400">+{mod.pts} pts on completion</p>
                      </div>
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="text-xs text-[#FF6B00] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Start →
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />

      <DeleteAccountModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
      />
    </>
  );
}
