export const STATES = [
  "Pan India",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
];

export const AGE_GROUPS = ["18–24", "25–35", "36–50", "Above 50"];

export type UserProfile = {
  state: string;
  ageGroup: string;
  firstTimeVoter: boolean;
};

export type ChecklistItem = {
  id: string;
  text: string;
};

export type TimelineStage = {
  id: number;
  slug: string;
  icon: string;
  title: string;
  tagline: string;
  summary: string;
  details: string;
  link?: { text: string; url: string };
  stateNote: (state: string) => string | null;
  color: string;
  accentColor: string;
  badgeUnlock?: string;
};

/* ─────────────────────────────────────────────────────────────
   OFFICIAL 8-STAGE INDIAN ELECTION PROCESS (ECI)
   Source: eci.gov.in — "Conduct of Elections" handbook
───────────────────────────────────────────────────────────── */
export const STAGES: TimelineStage[] = [
  {
    id: 1,
    slug: "announcement",
    icon: "📢",
    title: "Election Announcement",
    tagline: "The democratic calendar begins",
    summary: "The Election Commission of India announces the election dates. The Model Code of Conduct (MCC) starts immediately to ensure fair play.",
    details: "The schedule includes polling dates, nomination deadlines, and counting day. Government schemes freeze under MCC. This is the time to start paying attention to candidates and prepare to vote.",
    link: { text: "Official ECI Announcements", url: "https://eci.gov.in" },
    stateNote: (state) => {
      if (state === "Jammu & Kashmir") return "J&K elections often involve multiple phases. Check your exact district date.";
      if (state === "Uttar Pradesh") return "UP's 80 seats are spread across many phases. Find your specific date.";
      return null;
    },
    color: "from-purple-50 to-violet-50",
    accentColor: "#7C3AED",
  },
  {
    id: 2,
    slug: "voter-registration",
    icon: "📋",
    title: "Voter Registration",
    tagline: "Your name is your right",
    summary: "Electoral rolls are updated before elections. You must ensure your name is on the list to vote.",
    details: "New voters can apply using Form 6. To correct details, use Form 8. You can do this online or via your local Booth Level Officer (BLO).",
    link: { text: "Search Voter List", url: "https://electoralsearch.eci.gov.in" },
    stateNote: (state) => {
      if (state === "Rajasthan") return "Look out for BLO camps at your gram panchayat.";
      if (state === "Maharashtra") return "College students can register directly at campus drives.";
      return null;
    },
    color: "from-blue-50 to-indigo-50",
    accentColor: "#1A2C6B",
    badgeUnlock: "first-step",
  },
  {
    id: 3,
    slug: "nomination",
    icon: "🗳️",
    title: "Candidate Nominations",
    tagline: "Who wants your vote?",
    summary: "Candidates file their official paperwork and declare their wealth, education, and criminal records (if any).",
    details: "All candidate affidavits are public. This is your chance to research who is standing from your area. Look for candidates who promise to solve real local issues.",
    link: { text: "Check Candidate Affidavits", url: "https://affidavit.eci.gov.in" },
    stateNote: (state) => {
      if (state === "Bihar") return "Always check candidate affidavits on the portal before deciding.";
      return null;
    },
    color: "from-emerald-50 to-teal-50",
    accentColor: "#059669",
    badgeUnlock: "researcher",
  },
  {
    id: 4,
    slug: "scrutiny",
    icon: "🔍",
    title: "Checking the Candidates",
    tagline: "Filtering the final list",
    summary: "The Election Officer checks all candidate papers. Invalid applications are rejected, and some candidates may withdraw.",
    details: "After 2 days, the final list of contesting candidates is published. Your voting machine (EVM) will have exactly these names and symbols.",
    link: { text: "View Candidate List (ECI)", url: "https://eci.gov.in/candidate-nomination/" },
    stateNote: (state) => {
      if (state === "Tamil Nadu") return "Many candidates withdraw late due to alliances. Wait for the final list.";
      return null;
    },
    color: "from-cyan-50 to-sky-50",
    accentColor: "#0284C7",
  },
  {
    id: 5,
    slug: "campaign",
    icon: "🎙️",
    title: "The Campaign",
    tagline: "Listen, learn, and verify",
    summary: "Parties hold rallies and share their promises. You must be careful to spot fake news and report any bribery.",
    details: "Read manifestos, attend local meetings, and do not forward unverified WhatsApp messages. You can report anyone offering money for votes using the cVIGIL app.",
    link: { text: "Fact-check on BoomLive", url: "https://www.boomlive.in/fact-check" },
    stateNote: (state) => {
      if (state === "Rajasthan") return "Help your village verify news before sharing it further.";
      return null;
    },
    color: "from-rose-50 to-pink-50",
    accentColor: "#E11D48",
  },
  {
    id: 6,
    slug: "polling",
    icon: "✅",
    title: "Voting Day",
    tagline: "Your voice, your power",
    summary: "Go to your polling booth, press the button on the EVM, and see the printed slip to confirm your vote.",
    details: "Booths open from 7 AM to 6 PM. Carry your Voter ID (or Aadhaar/PAN). You will get an ink mark on your finger. Senior citizens get priority lines.",
    link: { text: "Know Your Booth", url: "https://electoralsearch.eci.gov.in" },
    stateNote: (state) => {
      if (state === "Himachal Pradesh") return "Polling staff trek hours in snow for you. Honour their effort by voting.";
      return null;
    },
    color: "from-amber-50 to-yellow-50",
    accentColor: "#D97706",
    badgeUnlock: "sacred-voter",
  },
  {
    id: 7,
    slug: "counting",
    icon: "📊",
    title: "Counting Day",
    tagline: "The results are revealed",
    summary: "Votes are counted electronically. The results are announced constituency by constituency.",
    details: "Follow only the official ECI website for live results to avoid fake updates. The candidate with the most votes in your area becomes your MP/MLA.",
    link: { text: "Official Live Results", url: "https://results.eci.gov.in" },
    stateNote: (state) => {
      if (state === "Uttar Pradesh") return "UP results often decide the direction of the national government.";
      return null;
    },
    color: "from-indigo-50 to-blue-50",
    accentColor: "#4F46E5",
  },
  {
    id: 8,
    slug: "government-formation",
    icon: "🏛️",
    title: "Government Formation",
    tagline: "Holding them accountable",
    summary: "The winning party forms the government. Your duty now is to track their work for the next 5 years.",
    details: "Democracy doesn't end on voting day. Save your MP's contact details, ask questions, and use RTI to demand information on local projects.",
    link: { text: "File an RTI online", url: "https://rtionline.gov.in" },
    stateNote: (state) => {
      if (state === "Kerala") return "Join local citizen groups to track your elected representative's work.";
      return null;
    },
    color: "from-green-50 to-emerald-50",
    accentColor: "#16A34A",
    badgeUnlock: "yatra-completer",
  },
];

/* ─── Badge definitions (unchanged) ─── */
export const BADGES = [
  {
    id: "first-step",
    icon: "🌱",
    title: "First Step Taken",
    description: "Started voter registration journey",
    color: "bg-amber-100 border-amber-300 text-amber-800",
  },
  {
    id: "researcher",
    icon: "🔍",
    title: "Democracy Detective",
    description: "Investigated candidates before voting",
    color: "bg-blue-100 border-blue-300 text-blue-800",
  },
  {
    id: "fact-checker",
    icon: "✅",
    title: "Truth Guardian",
    description: "Completed the Myth Buster challenges",
    color: "bg-green-100 border-green-300 text-green-800",
  },
  {
    id: "sacred-voter",
    icon: "🗳️",
    title: "Sacred Voter",
    description: "Understood the Voting Day stage",
    color: "bg-orange-100 border-orange-300 text-orange-800",
  },
  {
    id: "halfway",
    icon: "🏅",
    title: "Halfway Hero",
    description: "Completed 4 stages of your Yatra",
    color: "bg-purple-100 border-purple-300 text-purple-800",
  },
  {
    id: "yatra-completer",
    icon: "🏆",
    title: "Yatra Completer",
    description: "Completed all 8 stages of democratic journey",
    color: "bg-yellow-100 border-yellow-300 text-yellow-800",
  },
  {
    id: "informed-voter",
    icon: "🎓",
    title: "Informed Voter",
    description: "Understood 6+ stages across the Yatra",
    color: "bg-teal-100 border-teal-300 text-teal-800",
  },
  {
    id: "quiz-master",
    icon: "🧠",
    title: "Quiz Master",
    description: "Scored 8/10 or higher on the Knowledge Quiz",
    color: "bg-indigo-100 border-indigo-300 text-indigo-800",
  },
  {
    id: "myth-slayer",
    icon: "⚔️",
    title: "Myth Slayer",
    description: "Busted 6 or more myths correctly in the arena",
    color: "bg-rose-100 border-rose-300 text-rose-800",
  },
  {
    id: "simulator-hero",
    icon: "🗳️",
    title: "Simulator Hero",
    description: "Completed the full Election Simulator experience",
    color: "bg-cyan-100 border-cyan-300 text-cyan-800",
  },
];

/** Set of valid stage slugs — the only IDs that should ever count toward progress */
export const VALID_SLUGS = new Set(STAGES.map((s) => s.slug));

/** Count only IDs that are real stage slugs (ignores stale old checklist IDs) */
export function countValidStages(checkedItems: string[]): number {
  return checkedItems.filter((id) => VALID_SLUGS.has(id)).length;
}
