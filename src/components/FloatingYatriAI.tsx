"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Sparkles, Volume2, VolumeX,
  Mic, MicOff, Minimize2, Maximize2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";

/* ─── Types ─── */
type Message = { role: "user" | "ai"; text: string };

/* ─── Page context map ─── */
const PAGE_CONTEXT: Record<string, string> = {
  "/": "JagrukYatra homepage",
  "/my-journey": "My Journey — 8-stage ECI election process timeline",
  "/simulator": "Election Simulator — EVM polling booth experience",
  "/myth-buster": "Myth Buster Arena — election myth vs fact game",
  "/quiz": "Voter Knowledge Quiz",
  "/yatri-ai": "Yatri AI full chat page",
  "/profile": "User profile and Jagruk Score",
  "/certificate": "Completion certificate page",
};

/* ─── Quick suggestions ─── */
const SUGGESTIONS = [
  "How do I register to vote?",
  "What is NOTA?",
  "How does EVM work?",
  "What is Model Code of Conduct?",
  "Who can contest elections?",
  "मुझे वोट कैसे डालना है?",
];

/* ─── Text-to-Speech ─── */
function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  utter.rate = 0.88;
  utter.pitch = 1.05;
  window.speechSynthesis.speak(utter);
}
function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/* ─── Gemini API call ─── */
async function callYatriAPI(
  message: string,
  history: Message[],
  context: string
): Promise<string> {
  const res = await fetch("/api/yatri", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, context }),
  });
  const data = await res.json();
  if (data.error && !data.reply) throw new Error(data.error);
  return data.reply ?? "I couldn't generate a response. Please try again.";
}

/* ═══════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════ */
export default function FloatingYatriAI() {
  const pathname = usePathname();
  const pageContext = PAGE_CONTEXT[pathname] ?? "JagrukYatra";

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPulsed, setHasPulsed] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  /* Auto-scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Focus input when opened */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  /* One-time gentle pulse on very first visit */
  useEffect(() => {
    const isFirstVisit = !sessionStorage.getItem("yatri_pulsed");
    if (isFirstVisit) {
      setHasPulsed(false);
      sessionStorage.setItem("yatri_pulsed", "true");
      const timer = setTimeout(() => setHasPulsed(true), 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  /* ── Send message ── */
  const ask = useCallback(async (q: string) => {
    const userMsg = q.trim();
    if (!userMsg || loading) return;

    setError(null);
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    setQuery("");

    try {
      const reply = await callYatriAPI(userMsg, messages, pageContext);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch (err) {
      console.error(err);
      setError("Network issue. Check your connection and try again.");
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "Namaste! I'm having a little trouble connecting right now. Please try again in a moment, or visit eci.gov.in for official election information. 🙏",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, pageContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(query);
  };

  /* ── TTS toggle ── */
  const handleSpeak = (text: string) => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      speak(text);
      setSpeaking(true);
      // Auto-reset after ~30s
      setTimeout(() => setSpeaking(false), 30000);
    }
  };

  /* ── Voice input (Web Speech API) ── */
  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: { results: { transcript: string }[][] }) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const chatHeight = expanded ? "max-h-[80vh]" : "max-h-[70vh]";
  const chatWidth = expanded ? "sm:w-[520px]" : "sm:w-[400px]";

  return (
    <>
      {/* ── Floating trigger button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FF6B00] to-amber-400 rounded-full shadow-xl shadow-orange-300/50 flex items-center justify-center group"
            aria-label="Open Yatri AI chat"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
          >
            <Image src="/icon.svg" alt="Yatri AI" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" />
            
            {/* One-time Soft Pulse on First Load */}
            {!hasPulsed && (
              <motion.span 
                className="absolute inset-0 rounded-full bg-[#FF6B00]/40 pointer-events-none"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1.5, repeat: 2, ease: "easeOut" }}
              />
            )}

            {/* Premium Hover Glow Effect */}
            <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none blur-sm scale-110" />
            
            {/* Tooltip */}
            <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Ask Yatri AI 🤖
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 50, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.88 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className={`fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] ${chatWidth} ${chatHeight} bg-white dark:bg-[#020B1F] rounded-3xl shadow-2xl shadow-gray-900/20 dark:shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-orange-100 dark:border-[#0F1C38] flex flex-col overflow-hidden transition-all duration-300`}
          >
            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-[#1A2C6B] to-[#253A8E] shrink-0">
              <div className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <Image src="/icon.svg" alt="Yatri AI" width={28} height={28} className="w-7 h-7 drop-shadow-sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1A2C6B]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm flex items-center gap-1.5" style={{ fontFamily: "var(--font-poppins)" }}>
                  Yatri AI
                  <Sparkles className="w-3.5 h-3.5 text-orange-300" />
                </div>
                <div className="text-blue-200 text-[11px] truncate">
                  {pageContext}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={expanded ? "Minimize" : "Maximize"}
                >
                  {expanded
                    ? <Minimize2 className="w-3.5 h-3.5 text-white" />
                    : <Maximize2 className="w-3.5 h-3.5 text-white" />
                  }
                </button>
                <button
                  onClick={() => { setOpen(false); stopSpeaking(); }}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Welcome state */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-3"
                >
                  <div className="text-3xl mb-2">🇮🇳</div>
                  <p className="text-gray-700 dark:text-gray-200 font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-poppins)" }}>
                    Namaste! I&apos;m Yatri
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mb-4 leading-relaxed">
                    Your AI election guide. Ask me anything about voting, elections, or your rights as a citizen — in English or Hindi.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => ask(s)}
                        className="text-xs bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-[#FF6B00] dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 px-3 py-1.5 rounded-full transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Message bubbles */}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                >
                  {msg.role === "ai" && (
                    <div className="shrink-0 mt-0.5">
                      <Image src="/icon.svg" alt="Yatri AI" width={28} height={28} className="w-7 h-7 drop-shadow-sm" />
                    </div>
                  )}

                  <div className={`max-w-[82%] ${msg.role === "user" ? "" : "flex-1"}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#FF6B00] text-white rounded-tr-sm ml-auto shadow-md shadow-orange-500/20"
                          : "bg-gray-50 dark:bg-[#0F1C38] border border-gray-100 dark:border-[#1e325c] text-gray-800 dark:text-[#F1F5F9] rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {/* Render newlines */}
                      {msg.text.split("\n").map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < msg.text.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </div>

                    {/* TTS button for AI messages */}
                    {msg.role === "ai" && (
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="mt-1 ml-1 flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#FF6B00] transition-colors"
                        aria-label="Listen to this answer"
                      >
                        {speaking
                          ? <><VolumeX className="w-3 h-3" /> Stop</>
                          : <><Volume2 className="w-3 h-3" /> Listen</>
                        }
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Thinking indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-2"
                >
                  <div className="shrink-0">
                    <Image src="/icon.svg" alt="Yatri AI" width={28} height={28} className="w-7 h-7 drop-shadow-sm" />
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0F1C38] border border-gray-100 dark:border-[#1e325c] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-orange-400 dark:bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-orange-400 dark:bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-orange-400 dark:bg-[#FF6B00] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                    <span className="text-xs text-gray-400 dark:text-[#CBD5E1]">Yatri is thinking…</span>
                  </div>
                </motion.div>
              )}

              {/* Error message */}
              {error && (
                <p className="text-xs text-red-400 text-center px-4">{error}</p>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input area ── */}
            <div className="border-t border-orange-100 dark:border-[#0F1C38] bg-white dark:bg-[#020B1F] shrink-0">
              {/* Voice listening indicator */}
              {listening && (
                <div className="px-4 pt-2 flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-4 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
                    <span className="w-1 h-5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                    <span className="w-1 h-4 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="w-1 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
                  </span>
                  <span className="text-xs text-red-500 font-medium">Listening… speak now</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-3 flex gap-2">
                {/* Voice input button */}
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    listening
                      ? "bg-red-500 hover:bg-red-600 shadow-md shadow-red-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                  }`}
                  aria-label={listening ? "Stop voice input" : "Start voice input"}
                  title={listening ? "Stop listening" : "Voice input"}
                >
                  {listening
                    ? <MicOff className="w-4 h-4 text-white" />
                    : <Mic className="w-4 h-4" />
                  }
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type or speak your question…"
                  disabled={loading}
                  className="flex-1 bg-gray-50 dark:bg-[#0F1C38] border border-gray-200 dark:border-[#1e325c] text-gray-900 dark:text-[#F1F5F9] placeholder-gray-400 dark:placeholder-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6B00] dark:focus:border-[#FF6B00] focus:bg-white dark:focus:bg-[#13223F] transition-all disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  aria-label="Send message"
                  className="w-11 h-11 bg-[#FF6B00] hover:bg-[#E05500] disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>

              {/* Powered by Gemini badge */}
              <div className="pb-2 flex justify-center">
                <span className="text-[10px] text-gray-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Powered by Google Gemini
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
