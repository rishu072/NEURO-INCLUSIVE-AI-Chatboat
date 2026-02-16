# 🧠 NeuroAI – Smart Companion for Neurodivergent Minds

NeuroAI is a premium, privacy-first AI assistant designed to help neurodivergent individuals (ADHD, Autism, Dyslexia) overcome executive dysfunction. It turns mounting pressure into momentum by decomposing overwhelming goals into **"Micro-Wins"**—small, non-intimidating, and immediately actionable steps.

---

## 🚀 Quick Start (Docker)

The fastest way to run NeuroAI is using Docker. No local installation is required.

### 1. Using Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/rishu072/NEURO-INCLUSIVE-AI.git
cd NEURO-INCLUSIVE-AI

# Start the application
docker compose up --build
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Manual Docker Build & Run
```bash
# Build the image
docker build -t neuroai-app .

# Run the container
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key_here neuroai-app
```

---

## 📖 How it Works

1. **Personalized Onboarding**: The app starts with a multi-step wizard to understand your specific neurodivergent experience and visual preferences.
2. **AI Decomposition**: When you enter a goal (e.g., "Clean the kitchen"), the app uses **Google Gemini AI** to break it down into 5-10 tiny steps.
3. **Single-Task Focus**: To prevent "choice paralysis," the dashboard shows only **one step at a time**.
4. **Local Sovereignty**: All your tasks, profile data, and progress are stored **locally in your browser** (IndexedDB). Your data never leaves your device.
5. **Dopamine Loops**: Every completion triggers celebration animations (confetti), XP gains, and badge unlocks to keep you motivated.

---

## ✨ Premium Features

### 🎯 AI & Intelligence
- **Task Decomposition**: Intelligent goal breakdown using Gemini 2.0 Flash.
- **Micro-Win Philosophy**: Psychology-backed approach to reducing "task wall" anxiety.
- **PII Masking**: Automatically redacts personal information before it ever hits the AI.

### 🎨 Neuro-Inclusive Design
- **Bionic Reading Mode**: Bolds fixation points to guide eyes and reduce reading fatigue.
- **Dyslexia Support**: Toggle between OpenDyslexic, Lexend, and Inter fonts.
- **Reduced Motion**: Disable animations with a single toggle for sensory sensitivity.

### 🏆 Gamification
- **Badge System**: Unlock 10+ unique achievement badges.
- **Streak Management**: Build and maintain daily habits.
- **XP & Levels**: Visual progression of your cognitive achievements.

---

## 🛠 Tech Stack
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4.
- **AI**: Google Generative AI (Gemini SDK).
- **State/Storage**: Zustand (State), Dexie.js (IndexedDB).
- **Animations**: Framer Motion, Canvas Confetti.
- **Infrastructure**: Docker & Multi-stage Alpine Builds.

---

## 📁 Project Structure

```text
src/
├── app/                  # Next.js Pages & API Routes
│   ├── dashboard/        # Main Task Center
│   ├── onboarding/       # Interactive Setup
│   ├── tasks/            # Goal Creation
├── components/           # UI Component Library
│   ├── accessibility/    # Bionic Text & Font Logic
│   ├── gamification/     # Badges & Confetti
│   └── task/             # Decomposition UI
├── store/                # Zustand State Management
└── lib/                  # Database & Utility Functions
```

---

## 🔑 Environment Variables

For Docker Compose, create a `.env` file in the project root:
```env
# Required for AI decomposition
GEMINI_API_KEY=your_google_gemini_key

# Optional
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_key
```

For local development, create a `.env.local` file:
```env
# Required for AI decomposition
GEMINI_API_KEY=your_google_gemini_key

# Optional
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_key
```

---

## 📄 License
MIT License - Built for the neurodiverse community by Rishu.
