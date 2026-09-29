# StudyForge 2.0: AI-Powered Academic Operating System

StudyForge is a modern, full-stack learning platform designed to help students and developers master complex subjects, retain knowledge permanently, and maintain peak focus. Built with Next.js (App Router), TypeScript, Tailwind CSS, Google Gemini, and MongoDB, it integrates algorithmic active recall, procedural audio synthesis, and long-term retention analytics at zero external hosting cost.

🌐 **Live Demo:** [https://studyforge-rm.vercel.app/](https://studyforge-rm.vercel.app/)

---

## Core Features

### 1. Spaced Repetition Flashcards (SuperMemo SM-2)
- **Mathematical SM-2 Algorithm:** Calculates cognitive review intervals ($I_n$, $EF$, and next review dates) based on active recall difficulty ratings (Again, Hard, Good, Easy).
- **Interactive 3D Study Session:** Keyboard-driven flip cards with 3D CSS perspective transforms and real-time retention breakdown.
- **1-Click AI Flashcard Generator:** Transforms any study note into high-yield active recall flashcard pairs using Google Gemini via Genkit with compact token consumption.

### 2. Procedural Web Audio Synthesizer & Focus Timer
- **Mathematical DSP Soundscapes:** Generates ambient audio entirely in-browser using the Web Audio API (`AudioContext`, `BiquadFilterNode`, and LFO modulation)—zero external MP3 streaming or hosting bandwidth.
  - *Rain:* Filtered pink noise ($1/f$) with breeze modulation.
  - *Ocean Waves:* Brownian noise ($1/f^2$) with wave swell LFO.
  - *White Noise:* Broadband spectral focus masking.
  - *40Hz Binaural Beats:* Dual sine wave stereo tone for gamma wave cognitive stimulation.
- **Tibetan Singing Bowl Chimes:** Additive sine chord synthesis with exponential decay for focus and break transitions.
- **Fullscreen Zen Mode (F):** Minimalist timer display with pulsating focus breathing glow, live tab countdown, and sound controls.

### 3. GitHub-Style 365-Day Study Activity Heatmap & Streaks
- **Daily Activity Logging:** Automated tracking of focus minutes, cards reviewed, tasks completed, and notes written via a compound-indexed MongoDB schema.
- **Streak Calculation Engine:** Algorithmic calculation of active consecutive study streaks and all-time records.
- **53-Week Heatmap:** Interactive contribution grid with 5 color intensity tiers and tooltips detailing daily productivity breakdown.
- **Velocity Analytics:** Past 7 days focus time bar chart and activity mix distribution.

### 4. Asymmetrical Bento Dashboard
- **Personalized Hero Bar:** Time-sensitive greetings, live streak counter, quick action shortcuts, and real-time review alerts.
- **Bento Card Architecture:** High-priority cards for spaced repetition, ambient soundscapes, quick-access notes, daily tasks, and AI intelligence.

### 5. Smart Note-Taking & Daily Planning
- **Knowledge Vault:** Rich study note manager with search and rapid editing.
- **Action Planner:** Daily to-do lists and recurring weekly schedules to keep coursework organized.
- **AI Document Summarizer:** Rapid PDF and text summarization powered by Gemini.

---

## Tech Stack

- **Framework:** Next.js (App Router, Turbopack, Server Actions)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS, ShadCN UI, Lucide Icons
- **AI:** Google Gemini (Gemini 3.8 Flash) via Genkit
- **Audio DSP:** Native Browser Web Audio API (`AudioContext`)
- **Database:** MongoDB & Mongoose
- **Authentication:** JWT Sessions (OWASP Standards)

---

## File Structure

```
src/
├── ai/
│   ├── flows/
│   │   ├── generate-flashcards.ts   # Note-to-flashcard AI flow
│   │   ├── summarize-document.ts    # PDF document summarizer
│   │   └── summarize-note.ts        # Note summarizer
│   └── genkit.ts                    # Genkit Google AI configuration
├── app/
│   ├── (app)/                       # Authenticated routes
│   │   ├── study-zone/
│   │   │   ├── flashcards/          # Spaced repetition decks & 3D study mode
│   │   │   ├── notes/               # Knowledge base editor
│   │   │   ├── pomodoro/            # Focus timer with Web Audio
│   │   │   ├── analytics/           # 365-day heatmap & streak analytics
│   │   │   ├── summarizer/          # AI summarizer
│   │   │   └── todo/                # Tasks & weekly planner
│   │   └── layout.tsx
│   ├── (auth)/                      # Split-screen authentication
│   └── page.tsx                     # Landing page
├── components/
│   ├── study-zone/
│   │   ├── analytics/               # Heatmap & streak components
│   │   ├── flashcards/              # 3D flip card, deck dialogs
│   │   └── pomodoro-tab.tsx         # Focus timer & sound controls
│   └── ui/                          # ShadCN UI components
└── lib/
    ├── actions/                     # Server Actions (CRUD, auth, analytics)
    ├── algorithms/
    │   └── sm2.ts                   # SuperMemo SM-2 Spaced Repetition Algorithm
    ├── audio/
    │   └── ambient-synth.ts         # Procedural Web Audio API synthesizer
    ├── models/                      # Mongoose schemas (Deck, Flashcard, Activity, Note, Todo)
    ├── db.ts                        # MongoDB connection
    └── session.ts                   # JWT session management
```

---

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RizwanMolla/Study-Forge.git
   cd Study-Forge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (`.env`):**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_32_byte_session_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:9002](http://localhost:9002).