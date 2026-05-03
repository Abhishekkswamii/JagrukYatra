"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, User, AlertTriangle, CreditCard, FileText } from "lucide-react";

const scenarios = [
  {
    id: 1,
    icon: Clock,
    color: "#f59e0b",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    question: "What if I reach the polling booth late?",
    short: "Polling hours are strict. Here's what you need to know.",
    answer: `You can vote as long as you are inside the polling station before closing time (usually 5 PM or 6 PM). 
    
If you are in the queue before the official closing time, you WILL be allowed to vote even if voting extends past closing time. The presiding officer cannot turn away voters who are already in queue.

📌 Tip: Arrive at least 1 hour before closing to be safe. Check your constituency's exact timing on ECI website.`,
    steps: ["Check closing time for your booth on voterportal.eci.gov.in", "If in queue before closing, you will be allowed to vote", "Show your Voter ID / EPIC card to booth officer"],
  },
  {
    id: 2,
    icon: User,
    color: "#3b82f6",
    bg: "bg-blue-50 dark:bg-blue-900/10",
    border: "border-blue-200 dark:border-blue-800/30",
    question: "What if my name is misspelled?",
    short: "A minor spelling error doesn't disqualify you from voting.",
    answer: `If your name is slightly misspelled in the voter roll but your photo and address match, the Presiding Officer may still allow you to vote at their discretion.

For permanent correction, file Form 8 (Correction of entries) with your Electoral Registration Officer or through the Voter Helpline App.

⚠️ If your name is completely missing, you can file a complaint (Form 6) and request a tender vote.`,
    steps: ["Carry multiple ID proofs (Aadhaar, PAN)", "Show your photo matches the voter list entry", "Request tender ballot if refused", "File Form 8 for permanent correction"],
  },
  {
    id: 3,
    icon: AlertTriangle,
    color: "#ef4444",
    bg: "bg-red-50 dark:bg-red-900/10",
    border: "border-red-200 dark:border-red-800/30",
    question: "What if the VVPAT slip doesn't match my vote?",
    short: "This is a serious issue — here's exactly what to do.",
    answer: `If the VVPAT slip shows a different candidate than the one you voted for, you have the right to make a complaint on-the-spot.

Under Rule 49MA of the Conduct of Elections Rules, you can challenge the VVPAT result. The Presiding Officer will record your complaint in the Register.

The ECI takes such complaints very seriously. A verified discrepancy can lead to counting of all VVPAT slips in that polling station.`,
    steps: ["Immediately inform the Presiding Officer", "File written complaint under Rule 49MA", "Your vote will be marked as a 'test vote'", "You will be allowed to cast a fresh vote"],
  },
  {
    id: 4,
    icon: CreditCard,
    color: "#8b5cf6",
    bg: "bg-purple-50 dark:bg-purple-900/10",
    border: "border-purple-200 dark:border-purple-800/30",
    question: "What if I forget my Voter ID?",
    short: "You can still vote with 12 alternative documents!",
    answer: `The Election Commission of India allows 12 alternative photo ID documents if you don't have your EPIC card:

Aadhaar Card, Passport, Driving Licence, PAN Card, MNREGA Job Card, Photo Bank Passbook, Health Insurance Smart Card, Pension Document with Photo, NPR Smart Card, Officials' Service Identity Cards, Disability ID, and Smart Cards issued by RGI.

✅ Any ONE of these is sufficient to vote.`,
    steps: ["Carry Aadhaar / Passport / Driving License", "Your name must appear in the voter roll", "Show photo ID to the booth officer", "Proceed to vote normally"],
  },
  {
    id: 5,
    icon: FileText,
    color: "#10b981",
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
    border: "border-emerald-200 dark:border-emerald-800/30",
    question: "What is Form 17C and why does it matter?",
    short: "The most important election transparency tool you've never heard of.",
    answer: `Form 17C (Part I) is the Account of Votes Recorded — a critical transparency document that every Polling Agent is entitled to receive.

It contains: Total votes polled, EVM serial number, and the number of votes recorded. This is what civil society uses to verify election results.

Under Rule 56C of the Conduct of Elections Rules, 1961, the Presiding Officer MUST give a certified copy of Form 17C to the Polling Agent of each candidate.

📌 This is the foundation of election transparency in India.`,
    steps: ["Polling agents receive Form 17C at booth close", "It records total votes polled on EVM", "Used to cross-check with final count sheets", "Public can access via RTI after elections"],
  },
];

export default function ScenarioExplorer() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {scenarios.map((s, i) => {
        const Icon = s.icon;
        const isOpen = expanded === s.id;

        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
              isOpen ? s.border : "border-orange-100 dark:border-[#1e325c] hover:border-orange-200 dark:hover:border-orange-500/40"
            } bg-white dark:bg-card shadow-sm dark:shadow-[0_0_30px_rgba(255,103,31,0.02)] hover:shadow-md`}
          >
            <button
              className="w-full px-5 py-4 flex items-center gap-4 text-left"
              onClick={() => setExpanded(isOpen ? null : s.id)}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}
              >
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-foreground text-sm">{s.question}</p>
                <p className="text-gray-400 dark:text-muted-foreground text-xs mt-0.5 truncate">{s.short}</p>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0"
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className={`px-5 pb-5 border-t ${s.border}`}>
                    <div className={`mt-4 p-4 rounded-xl ${s.bg} text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line`}>
                      {s.answer}
                    </div>

                    {/* Steps */}
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What to do:</p>
                      <div className="space-y-2">
                        {s.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                              style={{ background: s.color }}
                            >
                              {idx + 1}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
