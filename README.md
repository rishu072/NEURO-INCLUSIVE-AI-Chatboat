# 🧠 NeuroAI – Smart Companion for Neurodivergent Minds

NeuroAI is a premium, privacy-first AI assistant designed to help neurodivergent individuals (ADHD, Autism, Dyslexia) overcome executive dysfunction. It turns mounting pressure into momentum by decomposing overwhelming goals into **"Micro-Wins"**—small, non-intimidating, and immediately actionable steps.

---

## 🚀 Quick Start (Local Dev)

```bash
# Clone the repository
git clone https://github.com/rishu072/NEURO-INCLUSIVE-AI-Chatboat.git
cd NEURO-INCLUSIVE-AI-Chatboat

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📖 How it Works

1. **Goal Input**: Type any goal (e.g., "Write my essay introduction") into the home page input.
2. **AI Decomposition**: The app calls a **Supabase Edge Function** (`decompose-goal`) which forwards the goal to **Google Gemini** via the Lovable AI gateway. If the gateway is unavailable, a template-based fallback produces 5 keyword-matched steps automatically.
3. **PII Masking**: Before the goal text is sent to the AI, emails, phone numbers, and URLs are redacted with regex—your sensitive info never leaves the browser raw.
4. **Editable Review**: After decomposition, a review screen lets you edit, delete, or regenerate steps before you begin.
5. **Single-Task Focus**: The dashboard shows only **one step at a time** to prevent choice paralysis, with a live countdown timer for each step.
6. **Streak Tracking**: Completions are tracked daily. Logged-in users get their streak synced to Supabase; guests use localStorage.

---

## ✨ Premium Features

### 🎯 AI & Intelligence
- **Task Decomposition**: Intelligent goal breakdown via Google Gemini (Gemini Flash, routed through Lovable AI gateway).
- **AI Fallback**: Keyword-matched template steps when the AI gateway is down or over quota.
- **PII Masking**: Automatically redacts emails, phone numbers, and URLs before they reach the AI.

### 🎨 Neuro-Inclusive Design
- **Bionic Reading Mode**: Bolds the first ~40% of each word to guide eyes and reduce reading fatigue.
- **Dyslexia Support**: Toggle between OpenDyslexic and Lexend fonts.
- **Reduced Motion**: Disable all animations with a single toggle for sensory sensitivity.
- **High Contrast**: Enhanced contrast mode for visual accessibility.
- **Editable Steps**: Review and customise AI-generated steps before starting.

### ⏱️ Step Timer
- Each micro-win card shows a **mm:ss countdown** based on the step's estimated duration.
- A subtle audio tone and a red visual flash notify you when time is up—without auto-advancing.

### 🏆 Momentum & Gamification
- **Daily Streak**: Build and maintain daily habits with streak persistence.
- **Progress Bar**: Visual progress through each session's steps.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Animations** | [Framer Motion](https://www.framer-motion.com/) |
| **Backend / Auth / DB** | [Supabase](https://supabase.com/) (Auth + PostgreSQL + Edge Functions) |
| **AI** | Google Gemini Flash (via [Lovable AI Gateway](https://lovable.dev)) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |

---

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── BionicText.tsx   # Bionic reading renderer
│   ├── FontToggle.tsx   # Font preference toggle
│   ├── GoalInput.tsx    # Goal submission form
│   ├── MicroWinCard.tsx # Step card with countdown timer
│   ├── ProgressBar.tsx  # Session progress bar
│   └── StreakCounter.tsx# Daily streak badge
├── hooks/
│   ├── useAuth.tsx      # Supabase auth hook
│   └── useProfile.tsx   # User profile + preferences hook
├── integrations/
│   └── supabase/        # Generated Supabase client & types
├── pages/
│   ├── Auth.tsx         # Login / sign-up page
│   ├── Index.tsx        # Main app page
│   ├── Preferences.tsx  # User preferences page
│   └── ResetPassword.tsx
supabase/
├── functions/
│   └── decompose-goal/  # Edge Function – AI decomposition + PII masking + fallback
└── migrations/          # SQL migrations for Supabase
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Your Supabase project credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

For the **Edge Function**, set the following secret in your Supabase dashboard
(*Project Settings → Edge Functions → Secrets*):

```
LOVABLE_API_KEY=your_lovable_ai_gateway_key
```

---

## 🗄 Database

A single `profiles` table (auto-created on first sign-in via trigger) stores per-user preferences:

| Column | Type | Description |
|---|---|---|
| `theme` | text | `"light"` or `"dark"` |
| `accent_color` | text | `"sage"`, `"amber"`, `"ocean"`, `"lavender"`, `"coral"` |
| `font_preference` | text | `"lexend"` or `"dyslexic"` |
| `font_size` | text | `"small"`, `"medium"`, `"large"` |
| `reduced_motion` | boolean | Disable animations |
| `high_contrast` | boolean | High-contrast mode |
| `bionic_reading` | boolean | Bionic reading mode |
| `steps_per_session` | integer | Requested step count (3–10) |
| `timer_duration` | integer | Default step timer in minutes |
| `break_reminders` | boolean | Break reminder notifications |
| `streak_count` | integer | Current daily streak |
| `last_streak_date` | date | Date of last completed session |

---

## 📄 License
MIT License – Built for the neurodiverse community by Rishu.
