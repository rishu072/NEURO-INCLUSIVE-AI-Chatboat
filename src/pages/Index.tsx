import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut, Play, RefreshCw, Settings, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import BionicText from "@/components/BionicText";
import CompletionScreen from "@/components/CompletionScreen";
import GoalInput from "@/components/GoalInput";
import MicroWinCard from "@/components/MicroWinCard";
import ProgressBar from "@/components/ProgressBar";
import StreakCounter from "@/components/StreakCounter";
import { useAuth } from "@/hooks/useAuth";
import { useGoalSession } from "@/hooks/useGoalSession";
import { usePreferencesEffect } from "@/hooks/usePreferencesEffect";
import { useProfile } from "@/hooks/useProfile";
import { HERO_CARD_DELAY, HERO_TEXT_DELAY } from "@/lib/constants";
import { getTransition } from "@/lib/motion";
import { getLocalStreak } from "@/lib/streak";

const Index = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();

  // Apply accessibility / theme preferences to the DOM.
  usePreferencesEffect(profile);

  // All session state and handlers live in this hook.
  const {
    appState,
    isLoading,
    goal,
    steps,
    currentStep,
    completedCount,
    reviewSteps,
    handleGoalSubmit,
    handleReviewStepChange,
    handleReviewStepDelete,
    handleReviewRegenerate,
    handleReviewStart,
    handleStepComplete,
    handleSkip,
    handleReset,
  } = useGoalSession(profile, updateProfile);

  const bionicReading = profile?.bionic_reading ?? false;
  const reducedMotion = profile?.reduced_motion ?? false;
  const streak = profile ? profile.streak_count : getLocalStreak();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-backdrop" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" aria-hidden="true" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full relative">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={getTransition(reducedMotion, { duration: 0.4 })}
          className="text-xl font-semibold text-foreground tracking-tight display-font"
        >
          micro<span className="text-primary">wins</span>
        </motion.h1>

        <div className="flex items-center gap-2">
          <StreakCounter streak={streak} />

          {user ? (
            <>
              <button
                onClick={() => navigate("/preferences")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Preferences"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-6 pb-20 pt-10 sm:pt-14 lg:pt-16 relative">

        {/* Input screen */}
        {appState === "input" && (
          <div className="w-full max-w-5xl mx-auto">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(reducedMotion, { duration: 0.45, delay: HERO_TEXT_DELAY })}
                className="text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Tiny wins, real momentum
                </div>
                <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground leading-tight display-font">
                  Turn big goals into small, unstoppable moves.
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl">
                  Drop in your ambition and we will turn it into a clean, focused sequence you can finish in minutes.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-foreground">
                    Focused steps
                  </span>
                  <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-foreground">
                    Momentum tracking
                  </span>
                  <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-foreground">
                    No fluff, just progress
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(reducedMotion, { duration: 0.45, delay: HERO_CARD_DELAY })}
                className="rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 shadow-soft backdrop-blur"
              >
                <GoalInput onSubmit={handleGoalSubmit} isLoading={isLoading} />
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Average plan time: under 30 seconds</span>
                  <span>Private by default</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Review screen – editable step list before starting */}
        {appState === "review" && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition(reducedMotion, { duration: 0.35 })}
            className="w-full max-w-2xl mx-auto space-y-6"
          >
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Review your plan for</p>
              <h2 className="text-lg font-semibold text-foreground">
                <BionicText text={goal} enabled={bionicReading} />
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Edit or delete any step, then hit <strong>Start</strong> when you're ready.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-soft backdrop-blur space-y-3">
              <AnimatePresence>
                {reviewSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-2.5 text-xs text-muted-foreground font-mono w-5 shrink-0 text-right">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={step.step}
                      onChange={(e) => handleReviewStepChange(idx, e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      aria-label={`Edit step ${idx + 1}`}
                    />
                    <button
                      onClick={() => handleReviewStepDelete(idx)}
                      disabled={reviewSteps.length <= 1}
                      className="mt-1.5 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={`Delete step ${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReviewRegenerate}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Regenerate
              </button>
              <button
                onClick={handleReviewStart}
                disabled={reviewSteps.length === 0}
                className="flex-1 gradient-calm text-primary-foreground rounded-lg py-2.5 px-6 font-medium flex items-center justify-center gap-2 hover:shadow-glow transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                Start
              </button>
            </div>
          </motion.div>
        )}

        {/* Working screen */}
        {appState === "working" && (
          <div className="w-full max-w-3xl mx-auto space-y-8">
            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 shadow-soft backdrop-blur space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Working on</p>
                <h2 className="text-lg font-semibold text-foreground truncate max-w-md mx-auto">
                  <BionicText text={goal} enabled={bionicReading} />
                </h2>
              </div>
              <ProgressBar current={completedCount} total={steps.length} />
            </div>
            <MicroWinCard
              win={steps[currentStep]}
              index={currentStep}
              total={steps.length}
              onComplete={handleStepComplete}
              onSkip={handleSkip}
              bionicReading={bionicReading}
              reducedMotion={reducedMotion}
            />
          </div>
        )}

        {/* Completion screen */}
        {appState === "complete" && (
          <div className="w-full max-w-3xl mx-auto">
            <CompletionScreen
              goalTitle={goal}
              totalSteps={steps.length}
              onReset={handleReset}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
