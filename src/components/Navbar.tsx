"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, ChevronDown, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import OnboardingModal from "@/components/auth/OnboardingModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "@/context/LanguageContext";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [profileOpen, setProfileOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const pathname = usePathname();
  const { firebaseUser, userDoc, logOut, loading } = useAuth();
  const { language, setLanguage, t } = useTranslation();

  const navLinks = [
    { label: t("Home"), href: "/" },
    { label: t("My Journey"), href: "/my-journey" },
    { label: t("Simulator"), href: "/simulator" },
    { label: t("Myth Buster"), href: "/myth-buster" },
    { label: t("Quiz"), href: "/quiz" },
    { label: t("Yatri AI"), href: "/yatri-ai" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Show onboarding modal after first login if not yet completed
  useEffect(() => {
    if (firebaseUser && userDoc && !userDoc.onboardingComplete) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOnboarding(true);
    }
  }, [firebaseUser, userDoc]);

  // Close mobile menu or profile dropdown on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const openAuth = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setAuthOpen(true);
    setIsOpen(false);
  };

  const avatarInitial = userDoc?.displayName?.[0]?.toUpperCase() ?? firebaseUser?.email?.[0]?.toUpperCase() ?? "?";
  const displayName = userDoc?.displayName ?? firebaseUser?.displayName ?? "Voter";

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-[#020B1F]/90 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-[#0F1C38]"
            : "bg-white/50 dark:bg-[#020B1F]/50 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            {/* 1. Left Side: Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Image 
                  src="/icon.svg" 
                  alt="JagrukYatra Logo" 
                  width={40} 
                  height={40}
                  priority
                  className="drop-shadow-md group-hover:scale-105 transition-transform duration-300 ease-out" 
                />
              </div>
              <span className="text-[22px] font-extrabold tracking-tight" style={{ fontFamily: "var(--font-poppins)" }}>
                <span className="text-[#FF6B00]">Jagruk</span>
                <span className="text-[#1A2C6B]">Yatra</span>
              </span>
            </Link>

            {/* 2. Center Nav (Desktop) */}
            <nav className="hidden xl:flex items-center gap-5 2xl:gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`group relative px-1 py-2 text-sm 2xl:text-[15px] font-semibold whitespace-nowrap transition-colors ${
                      isActive ? "text-[#FF6B00] dark:text-orange-400" : "text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] dark:hover:text-orange-400"
                    }`}
                  >
                    {link.label}
                    <span 
                      className={`absolute left-0 bottom-0 w-full h-[3px] bg-[#FF6B00] rounded-t-full transition-transform origin-left duration-300 ease-out ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`} 
                    />
                  </Link>
                );
              })}
            </nav>

            {/* 3. Right Side */}
            <div className="hidden xl:flex items-center gap-3 2xl:gap-4 shrink-0">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00] dark:hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-[#1A2C6B]/20 transition-all text-xs font-bold"
              >
                <span className={language === "en" ? "text-[#FF6B00]" : "text-gray-400"}>EN</span>
                <span className="text-gray-300">|</span>
                <span className={language === "hi" ? "text-[#FF6B00]" : "text-gray-400"}>हिंदी</span>
              </button>

              <ThemeToggle />
              
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
              ) : firebaseUser ? (
                /* Logged-in user menu */
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-3 px-2 py-1.5 pr-3 rounded-full border border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-500/50 hover:bg-orange-50/50 dark:hover:bg-[#1A2C6B]/20 transition-all bg-white dark:bg-gray-800 shadow-sm hover:shadow"
                  >
                    {firebaseUser.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={firebaseUser.photoURL} alt="" className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-100" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B00] to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm border border-orange-200">
                        {avatarInitial}
                      </div>
                    )}
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight max-w-[120px] truncate">{displayName}</span>
                      {userDoc && (
                        <span className="text-[11px] font-semibold text-[#FF6B00] leading-tight">
                          {userDoc.jagrukScore} {language === "hi" ? "अंक" : "pts"}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0F1C38] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,103,31,0.08)] border border-gray-100 dark:border-[#1e325c] overflow-hidden z-50"
                      >
                        <div className="p-3 bg-gray-50/50 dark:bg-[#020B1F]/50 border-b border-gray-100 dark:border-[#1e325c]">
                          <p className="text-xs text-gray-500 dark:text-[#CBD5E1] font-medium px-1">{language === "hi" ? "के रूप में लॉग इन किया" : "Signed in as"}</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-[#F1F5F9] px-1 truncate">{firebaseUser.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors group/item"
                          >
                            <User className="w-4 h-4 text-gray-400 group-hover/item:text-[#FF6B00] transition-colors" />
                            <span className="text-sm font-semibold text-gray-700 group-hover/item:text-gray-900">{t("My Profile")}</span>
                          </Link>
                          <Link
                            href="/certificate"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors group/item"
                          >
                            <Award className="w-4 h-4 text-gray-400 group-hover/item:text-[#FF6B00] transition-colors" />
                            <span className="text-sm font-semibold text-gray-700 group-hover/item:text-gray-900">{t("Certificate")}</span>
                          </Link>
                        </div>
                        <div className="h-px bg-gray-100" />
                        <div className="p-1.5">
                          <button
                            onClick={async () => { setProfileOpen(false); await logOut(); }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors w-full text-left group/item"
                          >
                            <LogOut className="w-4 h-4 text-gray-400 group-hover/item:text-red-500 transition-colors" />
                            <span className="text-sm font-semibold text-gray-700 group-hover/item:text-red-600">{t("Log Out")}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Guest buttons */
                <>
                  <div className="flex items-center gap-2 text-[13px] text-gray-600 bg-gray-50/80 border border-gray-200 px-3.5 py-2 rounded-full font-semibold shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    {t("Guest Mode")}
                  </div>
                  <button
                    onClick={() => openAuth("signup")}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#E05500] hover:from-[#E05500] hover:to-[#C04000] text-white text-sm font-bold rounded-full shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5 border border-orange-500/50"
                  >
                    {t("Login to Save Progress")}
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="xl:hidden flex items-center gap-3">
              <ThemeToggle />
              {/* Language Toggle Mobile */}
              <button
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-[10px] font-bold"
              >
                {language === "en" ? "हि" : "EN"}
              </button>
              {!firebaseUser && !loading && (
                  <button
                  onClick={() => openAuth("signup")}
                  className="px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#E05500] text-white text-xs font-bold rounded-full shadow-sm"
                >
                  {t("Login")}
                </button>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 -mr-2 rounded-xl text-gray-600 hover:text-[#FF6B00] hover:bg-orange-50 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="xl:hidden overflow-hidden bg-white/95 dark:bg-[#020B1F]/95 backdrop-blur-md border-t border-gray-100 dark:border-[#0F1C38] shadow-[0_20px_40px_rgb(0,0,0,0.1)] absolute w-full"
            >
              <div className="px-4 py-5 flex flex-col gap-2 max-w-7xl mx-auto">
                <nav className="flex flex-col gap-1 mb-4">
                  {navLinks.map((link, i) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          className={`block px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all ${
                            isActive 
                              ? "bg-orange-50 dark:bg-orange-500/10 text-[#FF6B00] dark:text-[#FF6B00]" 
                              : "text-gray-700 dark:text-[#CBD5E1] hover:bg-gray-50 dark:hover:bg-[#0F1C38] hover:text-gray-900 dark:hover:text-[#F1F5F9]"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
                
                <div className="h-px bg-gray-100 w-full mb-4" />
                
                {firebaseUser ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-5 py-2 mb-2">
                      {firebaseUser.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firebaseUser.photoURL} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-amber-500 flex items-center justify-center text-white font-bold shadow-sm">
                          {avatarInitial}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{displayName}</p>
                        <p className="text-xs font-semibold text-[#FF6B00]">{userDoc?.jagrukScore ?? 0} {language === "hi" ? "अंक" : "pts"}</p>
                      </div>
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <User className="w-5 h-5 text-gray-400" /> {t("My Profile")}
                    </Link>
                    <button onClick={async () => { await logOut(); }} className="flex items-center gap-3 w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <LogOut className="w-5 h-5 text-red-400" /> {t("Log Out")}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 px-1 pb-2">
                    <button onClick={() => openAuth("login")} className="w-full px-5 py-3.5 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      {language === "hi" ? "मौजूदा खाते में लॉग इन करें" : "Log In to Existing Account"}
                    </button>
                    <button onClick={() => openAuth("signup")} className="w-full px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#E05500] text-white text-sm font-bold shadow-md shadow-orange-500/20">
                      {t("Create Account")}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </>
  );
}
