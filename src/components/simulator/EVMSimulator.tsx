"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, RotateCcw, Printer } from "lucide-react";

const candidates = [
  { id: 1, name: "Arjun Kumar Verma", party: "Pragati Dal", symbol: "🌾", color: "#22c55e", abbr: "PD" },
  { id: 2, name: "Sunita Sharma", party: "Jan Shakti Party", symbol: "✊", color: "#3b82f6", abbr: "JSP" },
  { id: 3, name: "Ramesh Patel", party: "Vikas Morcha", symbol: "🏗️", color: "#f59e0b", abbr: "VM" },
  { id: 4, name: "Priya Nair", party: "Janta Alliance", symbol: "🤝", color: "#8b5cf6", abbr: "JA" },
  { id: 5, name: "NOTA", party: "None of the Above", symbol: "✗", color: "#6b7280", abbr: "NOTA" },
];

interface Props {
  onVoteComplete?: () => void;
}

export default function EVMSimulator({ onVoteComplete }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [showVVPAT, setShowVVPAT] = useState(false);
  const [pressing, setPressing] = useState<number | null>(null);

  const handleSelect = (id: number) => {
    if (voted) return;
    setSelected(id);
  };

  const handleVote = () => {
    if (selected === null || voted) return;
    setPressing(selected);
    setTimeout(() => {
      setPressing(null);
      setVoted(true);
      setShowVVPAT(true);
      setTimeout(() => {
        setShowVVPAT(false);
        onVoteComplete?.();
      }, 3500);
    }, 600);
  };

  const handleReset = () => {
    setSelected(null);
    setVoted(false);
    setShowVVPAT(false);
    setPressing(null);
  };

  const votedCandidate = candidates.find((c) => c.id === selected);

  return (
    <div className="relative">
      {/* EVM Machine Body */}
      <div className="relative mx-auto max-w-md">
        {/* Ballot Unit */}
        <div
          className="rounded-2xl border-4 border-gray-700 shadow-2xl overflow-hidden"
          style={{ background: "linear-gradient(160deg, #2d3748 0%, #1a202c 100%)" }}
        >
          {/* Header */}
          <div className="bg-gray-800 px-5 py-3 flex items-center justify-between border-b border-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-mono font-bold">EVM READY</span>
            </div>
            <span className="text-gray-400 text-xs font-mono">LOK SABHA 2024</span>
            <div className="w-2 h-2 rounded-full bg-blue-400" />
          </div>

          {/* ECI Emblem Area */}
          <div className="bg-gray-750 px-5 py-2 border-b border-gray-600 text-center">
            <p className="text-gray-300 text-[10px] font-mono tracking-widest">ELECTION COMMISSION OF INDIA</p>
            <p className="text-gray-400 text-[9px] font-mono">BHARAT NIRVACHAN AAYOG</p>
          </div>

          {/* Candidate Buttons */}
          <div className="p-4 space-y-2">
            {candidates.map((c) => (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(c.id)}
                disabled={voted}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                  voted
                    ? selected === c.id
                      ? "border-green-500 bg-green-900/40"
                      : "border-gray-600 bg-gray-800/50 opacity-40"
                    : selected === c.id
                    ? "border-[#FF6B00] bg-orange-900/30 shadow-lg shadow-orange-900/30"
                    : "border-gray-600 bg-gray-800/60 hover:border-gray-400 hover:bg-gray-700/60"
                }`}
              >
                {/* Party Symbol */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border-2"
                  style={{ borderColor: c.color, background: `${c.color}22` }}
                >
                  {c.symbol}
                </div>

                {/* Candidate Info */}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                  <p className="text-gray-400 text-[10px] truncate">{c.party}</p>
                </div>

                {/* Blue button */}
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selected === c.id
                      ? voted
                        ? "bg-green-500 border-green-400"
                        : "bg-[#FF6B00] border-orange-400 shadow-md shadow-orange-500/50"
                      : "bg-gray-700 border-gray-500"
                  }`}
                  style={{ boxShadow: pressing === c.id ? "inset 0 2px 4px rgba(0,0,0,0.4)" : undefined }}
                >
                  {voted && selected === c.id ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${selected === c.id ? "bg-white" : "bg-gray-500"}`}
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Vote Button */}
          <div className="px-4 pb-4">
            {!voted ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleVote}
                disabled={selected === null}
                className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${
                  selected !== null
                    ? "bg-[#FF6B00] hover:bg-[#E05500] text-white shadow-lg shadow-orange-900/40"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {selected === null ? "← Select a candidate first" : "🗳️ PRESS TO VOTE"}
              </motion.button>
            ) : (
              <div className="text-center space-y-2">
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-400 font-bold text-sm font-mono"
                >
                  ✓ VOTE RECORDED SUCCESSFULLY
                </motion.p>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 mx-auto text-gray-400 hover:text-white text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Cancel & Re-vote (Demo)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* VVPAT Slip Animation */}
        <AnimatePresence>
          {showVVPAT && votedCandidate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="overflow-hidden mt-2"
            >
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 text-center shadow-lg relative">
                {/* Printer icon top */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-700 rounded-full p-1.5">
                  <Printer className="w-4 h-4 text-white" />
                </div>
                <p className="text-[9px] text-gray-400 font-mono tracking-widest mb-2 mt-2">VVPAT SLIP — VERIFY YOUR VOTE</p>
                <div
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border-2 mb-2"
                  style={{ borderColor: votedCandidate.color, background: `${votedCandidate.color}11` }}
                >
                  <span className="text-2xl">{votedCandidate.symbol}</span>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800">{votedCandidate.name}</p>
                    <p className="text-[10px] text-gray-500">{votedCandidate.party}</p>
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 font-mono">Slip visible for 7 seconds before destruction</p>
                <motion.div
                  className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-[#FF6B00]"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 3.5, ease: "linear" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
