<div align="center">

# 🇮🇳 JagrukYatra

### Your Personal Election Awareness Journey

**Built for PromptWars × Google for Developers**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-v9+-orange?logo=firebase)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Cloud_Run-2496ED?logo=docker)](https://cloud.google.com/run)

*Empowering 96.8 crore Indian voters through interactive, accessible, AI-powered civic education.*

🔗 **Live Demo:** [jagrukyatra.web.app](https://jagrukyatra-530292169895.asia-south1.run.app/)

</div>

---

## 🎯 What is JagrukYatra?

JagrukYatra ("Aware Journey") is a gamified civic education platform that guides every Indian citizen through their democratic rights — from voter registration to government accountability. Built with a focus on **rural accessibility**, **simple language**, and **official accuracy**.

### Core Philosophy
> Democracy starts with informed citizens. JagrukYatra makes election education fun, accessible, and deeply rooted in official ECI guidelines.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **My Journey** | 8-stage official ECI election process timeline with interactive checklists |
| 🗳️ **Election Simulator** | Realistic EVM polling booth simulation + what-if scenarios |
| ⚔️ **Myth Buster Arena** | Swipe-to-judge 8 election myths verified by ECI sources |
| 🧠 **Knowledge Quiz** | 10-question timed quiz across 4 categories with streak scoring |
| 🤖 **Yatri AI** | Floating AI assistant — always accessible on every page |
| 🏆 **Certificate** | Downloadable/shareable completion certificate with canvas rendering |
| 👤 **Profile** | Jagruk Score, earned badges, module progress tracking |
| 🌗 **Dark Mode** | Full patriotic dark theme with saffron/navy palette |

---

## 🗺️ The 8-Stage ECI Election Timeline

The **My Journey** section is the heart of JagrukYatra. It follows the **official Indian election process** as documented by the Election Commission of India:

```
Stage 1 → Announcement of Election Schedule (MCC comes into force)
Stage 2 → Voter List Revision & Registration (Form 6/8, SSR)
Stage 3 → Notification & Nomination Filing (Affidavits, ₹25K deposit)
Stage 4 → Scrutiny & Withdrawal of Nominations (Returning Officer review)
Stage 5 → Election Campaign (MCC active, 48-hour silence rule)
Stage 6 → Polling Day (7 AM – 6 PM, VVPAT verification)
Stage 7 → Counting of Votes (FPTP system, 5 VVPAT checks mandatory)
Stage 8 → Declaration of Results & Government Formation (RTI, accountability)
```

Each stage includes:
- ✅ **What Actually Happens** — official ECI process explained simply
- ✅ **Your Role as a Citizen** — specific actions every voter should take
- ✅ **Typical Timeline** — real durations (e.g., "Nomination window: 7–10 days")
- ✅ **State-specific notes** — personalised for 33 Indian states/UTs
- ✅ **Mark as Understood** checkboxes — contribute to your Jagruk Score

---

## 📊 Data Sources & Architecture

### Where the Election Data Comes From

**There is no official ECI public API.** All election process data in JagrukYatra is **manually researched from official government sources** and hardcoded as structured TypeScript data:

| Source | Data Used |
|---|---|
| [eci.gov.in](https://eci.gov.in) | 8-stage election process, MCC rules, polling timings |
| [Representation of People Act, 1951](https://legislative.gov.in) | Section 126 (campaign silence), Section 33(7), Section 62 |
| [Supreme Court Orders](https://main.sci.gov.in) | NOTA (PUCL vs UoI, 2013), VVPAT 5-EVM verification mandate |
| [affidavit.eci.gov.in](https://affidavit.eci.gov.in) | Nomination affidavit rules, security deposit amounts |
| [voters.eci.gov.in](https://voters.eci.gov.in) | Form 6/8/8A, Special Summary Revision timelines |
| [myneta.info](https://www.myneta.info) | Candidate statistics, criminal case percentages |
| [adrindia.org](https://adrindia.org) | ADR election analysis methodology |
| [rtionline.gov.in](https://rtionline.gov.in) | RTI filing process details |

### Why No Live Scraping?

For the PromptWars submission, static curated data was chosen intentionally:

```
Static JSON  ✅ Always available, zero latency, no breakage risk
Live scraping ❌ Breaks when ECI changes HTML, needs server, CAPTCHA risk
```

### Future Data Pipeline (Post-Launch Architecture)

For production scale, the recommended pipeline is:

```
ECI/MyNeta Website
        ↓
  Python Scraper (BeautifulSoup + Playwright)
  [Run before each election cycle]
        ↓
  Firestore Collection
  "candidates/{state}/{constituency}"
        ↓
  Next.js API Route → Client
  [Fast, reliable, no direct scraping]
```

**Best scraping target: [myneta.info](https://www.myneta.info)**
- Structured HTML tables, no CAPTCHA on most pages
- Consistent URL pattern: `myneta.info/loksabha2024/index.php?constituency_id={id}`
- Fields: candidate name, party, criminal cases, assets, education

```python
# Example scraper (Python + BeautifulSoup)
import requests
from bs4 import BeautifulSoup

def scrape_constituency(constituency_id: int):
    url = f"https://www.myneta.info/loksabha2024/index.php?constituency_id={constituency_id}"
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(r.text, "html.parser")
    table = soup.find("table", {"class": "w3-table-all"})
    # Parse rows → store in Firestore
    return parse_candidates(table)
```

---

## 🛠️ Tech Stack

```
Frontend       Next.js 16 (App Router) + TypeScript 5
Styling        Tailwind CSS v4 + custom CSS variables
Animations     Framer Motion 11
Auth           Firebase Auth v9+ (Email + Google OAuth)
Database       Cloud Firestore (users, progress, scores, badges)
AI Engine      Google Gemini 2.5 Flash via @google/generative-ai SDK
AI API Route   /api/yatri — server-side Gemini proxy with system prompt
Voice          Web Speech API (voice input + TTS — browser native)
Deployment     Google Cloud Run (Docker) or Vercel
Fonts          Inter + Poppins (Google Fonts, swap fallback)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/jagrukyatra.git
cd jagrukyatra
npm install
```

### 2. Set Up Firebase

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com) with:
- **Authentication** → Enable Email/Password + Google Sign-In
- **Firestore** → Create database in production mode

### 3. Environment Variables

Create `.env` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI — get free key at https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker / Google Cloud Run Deployment

> [!IMPORTANT]
> `GEMINI_API_KEY` is **never baked into the Docker image**. It is injected only at Cloud Run deploy time via `--set-env-vars`. This prevents the key from appearing in image layers or build logs.

### Step 1 — Build & Push Image (Firebase vars only)

```bash
# ✅ Do NOT pass GEMINI_API_KEY here — inject it at deploy time instead
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id \
  -t gcr.io/YOUR_GCP_PROJECT_ID/jagrukyatra:latest .

# Push to Google Container Registry
docker push gcr.io/YOUR_GCP_PROJECT_ID/jagrukyatra:latest
```

### Step 2 — Deploy to Cloud Run (inject Gemini key at runtime)

```bash
gcloud run deploy jagrukyatra \
  --image gcr.io/YOUR_GCP_PROJECT_ID/jagrukyatra:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars GEMINI_API_KEY=your_actual_gemini_api_key
```

### Step 2 (Alternative) — Use Google Secret Manager (recommended for production)

```bash
# Store key securely
echo -n "your_actual_gemini_api_key" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- --replication-policy=automatic

# Deploy with secret reference
gcloud run deploy jagrukyatra \
  --image gcr.io/YOUR_GCP_PROJECT_ID/jagrukyatra:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --update-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### Or Deploy to Vercel (Easier for demos)

```bash
npx vercel --prod
```

Then add all vars in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Type | Example |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Plain | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Plain | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Plain | `my-project` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Plain | `my-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Plain | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Plain | `1:123:web:abc` |
| `GEMINI_API_KEY` | **Secret** | `AIzaSy...` |

---

## 🔥 Firebase Schema

```
Firestore
└── users/
    └── {uid}/
        ├── uid: string
        ├── displayName: string
        ├── email: string
        ├── photoURL: string | null
        ├── state: string              # Selected Indian state
        ├── ageGroup: string           # "18–24" | "25–35" | ...
        ├── isFirstTimeVoter: boolean
        ├── onboardingComplete: boolean
        ├── jagrukScore: number        # Cumulative points
        ├── completedModules: string[] # ["my-journey", "quiz", ...]
        ├── earnedBadges: string[]     # ["quiz-master", "myth-slayer", ...]
        ├── completedChecklist: string[] # Checklist item IDs
        ├── createdAt: Timestamp
        └── updatedAt: Timestamp
```

---

## 🔐 Firestore Security Rules

> [!CAUTION]
> Firestore is in **test mode** (open read/write) by default. You MUST set these rules before going public — otherwise anyone can read or overwrite any user's data.

Go to **Firebase Console → Firestore Database → Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ✅ Users can only read and write their OWN document
    match /users/{uid} {
      allow read, write: if request.auth != null
                         && request.auth.uid == uid;
    }

    // ❌ Deny all other collections by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click **Publish**. This takes effect immediately.

**What these rules do:**
- ✅ Logged-in users can read/write only their own `users/{their_uid}` document
- ✅ No user can read another user's data
- ✅ Unauthenticated users cannot access Firestore at all
- ✅ Guest mode works via localStorage (never touches Firestore)

---

## 🏅 Badge System

| Badge | Unlock Condition |
|---|---|
| 🌱 First Step Taken | Started voter registration in My Journey |
| 🔍 Democracy Detective | Completed nomination research stage |
| 🗳️ Sacred Voter | Completed Polling Day checklist |
| 🏅 Halfway Hero | Completed 4+ stages |
| 🎓 Informed Voter | Completed 20+ checklist items |
| 🏆 Yatra Completer | Completed all 8 stages |
| ⚔️ Myth Slayer | Busted 6+ myths correctly |
| 🧠 Quiz Master | Scored 8/10+ on Knowledge Quiz |
| ✅ Truth Guardian | Completed Myth Buster |
| 🗳️ Simulator Hero | Completed Election Simulator |

---

## ♿ Accessibility (Rural User Focus)

- **Large touch targets** — minimum 44×44px for all interactive elements
- **Text-to-Speech** — Yatri AI answers have a 🔊 Listen button (Web Speech API)
- **Simple language** — plain Hindi-friendly English throughout
- **Offline-first** — Guest mode with localStorage works without internet
- **Low-end phones** — optimised bundle, no heavy dependencies
- **Safe-area padding** — supports notched phones (iPhone X+, Android)
- **High contrast** — saffron/navy/white patriotic palette passes WCAG AA

---

## 📁 Project Structure

```
jagrukyatra/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage (Hero + What's Inside + AI teaser)
│   │   ├── my-journey/           # 8-stage ECI election timeline
│   │   ├── simulator/            # EVM polling booth simulation
│   │   ├── myth-buster/          # Gamified myth vs fact arena
│   │   ├── quiz/                 # Timed knowledge quiz
│   │   ├── yatri-ai/             # Full Yatri AI chat page
│   │   ├── profile/              # User dashboard + badges
│   │   └── certificate/          # Downloadable completion certificate
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation + auth state
│   │   ├── FloatingYatriAI.tsx   # Global floating AI chat button
│   │   ├── journey/              # My Journey sub-components
│   │   └── auth/                 # Login/Signup modals + onboarding
│   ├── context/
│   │   └── AuthContext.tsx       # Firebase auth + Firestore sync
│   └── lib/
│       ├── firebase.ts           # Firebase initialisation
│       ├── firestore.ts          # Firestore helper functions
│       └── journeyData.ts        # 8-stage ECI election data (structured)
├── Dockerfile                    # Multi-stage Docker build for Cloud Run
├── next.config.ts                # Standalone output + image optimisation
└── .env                          # Firebase keys (gitignored)
```

---

## 🙏 Credits & Acknowledgements

- **Election Commission of India** — [eci.gov.in](https://eci.gov.in) for official election process documentation
- **Association for Democratic Reforms (ADR)** — [adrindia.org](https://adrindia.org) for candidate analysis methodology
- **MyNeta.info** — for candidate affidavit data structure reference
- **PromptWars × Google for Developers** — for inspiring this build

---

## 📜 Disclaimer

JagrukYatra is an **educational platform built for civic awareness**. It is not affiliated with the Election Commission of India. All election process information is sourced from publicly available official government documents and is accurate to the best of our knowledge. For authoritative information, always refer to [eci.gov.in](https://eci.gov.in).

---

<div align="center">

**Made with 🧡 for every Indian voter**

*जागरूक नागरिक, मजबूत लोकतंत्र*
*(Aware Citizen, Strong Democracy)*

</div>
