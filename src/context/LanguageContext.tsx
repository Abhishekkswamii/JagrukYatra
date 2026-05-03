"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Keep track of strings we've already sent to translate to avoid duplicates
  const pendingTranslations = useRef<Set<string>>(new Set());
  const translationQueue = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load
  useEffect(() => {
    const saved = localStorage.getItem("jagrukyatra_lang") as Language;
    if (saved === "hi" || saved === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = "en";
    }

    const cached = localStorage.getItem("jagrukyatra_dynamic_translations_hi");
    if (cached) {
      setTranslations(JSON.parse(cached));
    }
  }, []);

  // 2. Batch Processor for Real-time Translation
  const processQueue = async () => {
    if (translationQueue.current.length === 0) return;

    const batch = [...translationQueue.current];
    translationQueue.current = [];
    
    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strings: batch,
          targetLang: "hi"
        })
      });

      const { translated } = await response.json();

      if (Array.isArray(translated)) {
        setTranslations(prev => {
          const updated = { ...prev };
          batch.forEach((original, index) => {
            updated[original] = translated[index];
          });
          localStorage.setItem("jagrukyatra_dynamic_translations_hi", JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const queueTranslation = (text: string) => {
    if (language === "en" || translations[text] || pendingTranslations.current.has(text)) return;
    
    pendingTranslations.current.add(text);
    translationQueue.current.push(text);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(processQueue, 500); // Debounce to collect multiple strings
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("jagrukyatra_lang", lang);
    document.documentElement.lang = lang;
    if (lang === "hi") {
      // Refresh logic could go here
    }
  };

  /**
   * The magic t() function. 
   * It takes literal English and returns translated text.
   * If not translated yet, it returns original and queues it for translation.
   */
  const t = (text: string): string => {
    if (!text) return text;
    if (language === "en") return text;
    
    const translated = translations[text];
    if (translated) return translated;

    // Not translated yet? Queue it and return original for now
    queueTranslation(text);
    return text; 
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
