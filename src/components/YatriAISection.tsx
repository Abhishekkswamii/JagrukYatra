"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Send, Volume2, VolumeX, Mic, MicOff,
  Sparkles, RefreshCw, Info,
} from "lucide-react";
import Image from "next/image";

type Message = { role: "user" | "ai"; text: string };

const SUGGESTIONS = [
  "How do I register to vote?",
  "What is NOTA and when was it introduced?",
  "How does an EVM work? Is it safe?",
  "What is Model Code of Conduct?",
  "Who can contest Lok Sabha elections?",
  "What documents do I need to vote?",
  "वोटर ID कैसे बनवाएं?",
  "What is VVPAT and how does it verify my vote?",
  "How are election results counted in India?",
  "What can I do if my name is not on voter list?",
];

const CAPABILITIES = [
  { icon: "🗳️", text: "Voter registration (Form 6, 8, 8A)" },
  { icon: "📋", text: "8-stage ECI election process" },
  { icon: "🏛️", text: "Constitution & electoral laws" },
  { icon: "🛡️", text: "EVM, VVPAT, NOTA explained" },
  { icon: "📢", text: "Model Code of Conduct rules" },
  { icon: "🌏", text: "Hindi & English support" },
];

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
}

async function callYatriAPI(message: string, history: Message[]): Promise<string> {
  const res = await fetch("/api/yatri", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
      context: "Yatri AI dedicated chat page",
    }),
  });
  const data = await res.json();
  return data.reply ?? "I couldn't generate a response. Please try again.";
}

export default function YatriAIPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const ask = useCallback(async (q: string) => {
    const userMsg = q.trim();
    if (!userMsg || loading) return;
    setError(null);
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    setQuery("");
    try {
      const reply = await callYatriAPI(userMsg, messages);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch {
      const fallback = "Namaste! I'm having trouble connecting right now. Please try again, or visit eci.gov.in directly. 🙏";
      setMessages((m) => [...m, { role: "ai", text: fallback }]);
      setError("Connection issue — please retry");
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); ask(query); };

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input requires Chrome browser."); return; }
    const r = new SR();
    r.lang = "en-IN";
    r.onresult = (e: { results: { transcript: string }[][] }) => {
      setQuery(e.results[0][0].transcript);
      setListening(false);
    };
    r.onerror = r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-background flex transition-colors duration-300">
      {/* ── Left sidebar — desktop only ── */}
      <div className="hidden lg:flex flex-col w-72 xl:w-80 bg-white dark:bg-card border-r border-orange-100 dark:border-[#1e325c] p-6 shrink-0 shadow-sm z-10 transition-colors">
        {/* Yatri branding */}
        <div className="flex items-center gap-3 mb-8">
          <Image 
            src="/icon.svg" 
            alt="Yatri AI Logo" 
            width={48} 
            height={48} 
            className="drop-shadow-md hover:scale-105 transition-transform" 
          />
          <div>
            <h2 className="text-[#1A2C6B] dark:text-blue-400 font-extrabold text-lg" style={{ fontFamily: "var(--font-poppins)" }}>
              Yatri AI
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online — Powered by Gemini
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="mb-6 bg-orange-50/50 dark:bg-orange-500/10 p-4 rounded-2xl border border-orange-100/50 dark:border-orange-500/20">
          <p className="text-orange-800/60 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-3">
            What I can help with
          </p>
          <div className="space-y-3">
            {CAPABILITIES.map((c) => (
              <div key={c.text} className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300 text-sm font-medium">
                <span className="text-base shrink-0 drop-shadow-sm">{c.icon}</span>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3 px-1">
            Try asking
          </p>
          <div className="space-y-2">
            {SUGGESTIONS.slice(0, 6).map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="w-full text-left text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] hover:bg-orange-50 dark:hover:bg-orange-500/10 px-3 py-2.5 rounded-xl transition-all border border-transparent hover:border-orange-100 dark:hover:border-orange-500/30"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Clear chat */}
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="mt-auto flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 py-2.5 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-500/30"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear conversation
          </button>
        )}

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100/50 dark:border-blue-800/30">
          <Info className="w-3.5 h-3.5 text-blue-400 dark:text-blue-300 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-600/80 dark:text-blue-300/80 leading-relaxed font-medium">
            Yatri gives information based on official ECI guidelines. For legal queries, always verify at eci.gov.in.
          </p>
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-background transition-colors">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 bg-white dark:bg-card border-b border-orange-100 dark:border-[#1e325c] shadow-sm z-10 transition-colors">
          <Image 
            src="/icon.svg" 
            alt="Yatri AI Logo" 
            width={36} 
            height={36} 
            className="drop-shadow-sm" 
          />
          <div className="flex-1">
            <p className="text-[#1A2C6B] font-bold text-sm">Yatri AI</p>
            <p className="text-emerald-600 font-medium text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </p>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-gray-400 hover:text-gray-700 dark:hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          {/* Welcome screen */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 lg:py-20 text-center h-full"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="mb-6 drop-shadow-xl"
              >
                <Image 
                  src="/icon.svg" 
                  alt="Yatri AI" 
                  width={96} 
                  height={96} 
                  className="w-20 h-20 sm:w-24 sm:h-24" 
                />
              </motion.div>

              <h2 className="text-[#1A2C6B] dark:text-foreground text-2xl sm:text-3xl font-extrabold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>
                Namaste! I&apos;m <span className="text-[#FF6B00]">Yatri</span> 🙏
              </h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm sm:text-base max-w-md mb-8 leading-relaxed font-medium">
                Your AI-powered election guide. Ask me anything about Indian elections, voter rights, EVM machines, how to register to vote, or the Constitution — in <strong className="text-gray-700 dark:text-gray-300">English</strong> or <strong className="text-gray-700 dark:text-gray-300">Hindi</strong>.
              </p>

              {/* Suggestion grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                {SUGGESTIONS.slice(0, 8).map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => ask(s)}
                    className="text-left bg-white dark:bg-card hover:bg-orange-50 dark:hover:bg-orange-500/10 border border-gray-200 dark:border-[#1e325c] hover:border-orange-300 dark:hover:border-orange-500/30 text-gray-700 dark:text-gray-300 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] text-xs sm:text-sm font-medium px-4 py-3.5 rounded-2xl transition-all shadow-sm hover:shadow-md hover:shadow-orange-100 dark:hover:shadow-[0_0_20px_rgba(255,103,31,0.1)]"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message bubbles */}
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}
              >
                {/* AI avatar */}
                {msg.role === "ai" && (
                  <div className="shrink-0 mt-0.5">
                    <Image 
                      src="/icon.svg" 
                      alt="Yatri AI" 
                      width={40} 
                      height={40} 
                      className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm" 
                    />
                  </div>
                )}

                <div className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
                  <div
                    className={`px-5 py-3.5 sm:px-6 sm:py-4 rounded-[1.5rem] text-sm sm:text-base leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#FF6B00] text-white rounded-tr-sm shadow-orange-200 dark:shadow-[0_0_15px_rgba(255,103,31,0.2)]"
                        : "bg-white dark:bg-card border border-gray-100 dark:border-[#1e325c] text-gray-800 dark:text-gray-200 rounded-tl-sm"
                    }`}
                  >
                    {msg.text.split("\n").map((line, j, arr) => (
                      <span key={j}>
                        {line}
                        {j < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>

                  {/* TTS for AI messages */}
                  {msg.role === "ai" && (
                    <button
                      onClick={() => {
                        if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); }
                        else { speak(msg.text); setSpeaking(true); setTimeout(() => setSpeaking(false), 45000); }
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#FF6B00] transition-colors ml-2"
                    >
                      {speaking ? <><VolumeX className="w-3.5 h-3.5" /> Stop</> : <><Volume2 className="w-3.5 h-3.5" /> Listen</>}
                    </button>
                  )}
                </div>

                {/* User avatar */}
                {msg.role === "user" && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center shrink-0 text-sm sm:text-base shadow-sm">
                    🧑
                  </div>
                )}
              </motion.div>
            ))}

            {/* Loading */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 sm:gap-4 items-end w-full"
              >
                <div className="shrink-0">
                  <Image 
                    src="/icon.svg" 
                    alt="Yatri AI" 
                    width={40} 
                    height={40} 
                    className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm" 
                  />
                </div>
                <div className="bg-white dark:bg-card border border-gray-100 dark:border-[#1e325c] shadow-sm rounded-[1.5rem] rounded-tl-sm px-6 py-4 flex items-center gap-3">
                  <span className="flex gap-1.5">
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  <span className="text-xs font-semibold text-gray-400">Yatri is thinking…</span>
                </div>
              </motion.div>
            )}

            {error && (
              <div className="flex justify-center mt-2">
                <span className="bg-red-50 text-red-500 text-xs font-medium px-3 py-1.5 rounded-full border border-red-100">
                  {error}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Input area ── */}
        <div className="bg-white dark:bg-card border-t border-gray-200 dark:border-[#1e325c] p-4 sm:p-5 shrink-0 z-10 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)] transition-colors">
          <div className="max-w-4xl mx-auto relative">
            {listening && (
              <div className="absolute -top-10 left-4 bg-red-50 text-red-500 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                <span className="flex gap-0.5 items-end h-3">
                  {[3, 5, 4, 6, 3, 5].map((h, i) => (
                    <span key={i} className="w-[3px] bg-red-500 rounded-full animate-bounce" style={{ height: `${h * 2}px`, animationDelay: `${i * 80}ms` }} />
                  ))}
                </span>
                Listening… speak now
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-end bg-gray-50 dark:bg-black/20 p-2 rounded-[1.5rem] border border-gray-200 dark:border-[#1e325c] focus-within:border-orange-300 dark:focus-within:border-orange-500/50 focus-within:bg-white dark:focus-within:bg-card transition-all">
              {/* Voice button */}
              <button
                type="button"
                onClick={listening ? () => { recognitionRef.current?.stop(); setListening(false); } : startListening}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  listening
                    ? "bg-red-500 text-white shadow-md shadow-red-500/30 hover:bg-red-600"
                    : "bg-white dark:bg-card text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 border border-gray-200 dark:border-white/10 hover:border-orange-200 dark:hover:border-orange-500/30 shadow-sm"
                }`}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
              >
                {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <textarea
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ref={inputRef as any}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask about elections, voting rights, EVM… (English या हिंदी)"
                disabled={loading}
                rows={1}
                className="flex-1 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 px-2 py-3.5 text-sm sm:text-base outline-none resize-none min-h-[48px] max-h-[120px] overflow-y-auto font-medium"
              />

              <motion.button
                type="submit"
                disabled={!query.trim() || loading}
                whileTap={{ scale: 0.93 }}
                className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-amber-500 hover:to-orange-500 disabled:from-gray-300 disabled:to-gray-300 text-white disabled:text-gray-500 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-md shadow-orange-500/20 disabled:shadow-none"
                aria-label="Send"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </motion.button>
            </form>

            <div className="mt-3 flex justify-center">
              <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-orange-400" /> Powered by Google Gemini · Free for all Citizens
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
