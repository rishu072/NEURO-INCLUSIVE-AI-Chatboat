/**
 * useGoalSession
 * Encapsulates all goal/steps/currentStep/completedCount state,
 * localStorage persistence, and session-flow handlers.
 * Extracted from Index.tsx to keep that file focused on rendering.
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { SESSION_KEY } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { calculateNextStreak, incrementLocalStreak } from "@/lib/streak";
import { AppState, DecomposeGoalResponse, MicroWin, SessionData, UserProfile } from "@/types";

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

/** Reads the persisted session from localStorage, or returns null on miss/error. */
function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionData) : null;
  } catch {
    return null;
  }
}

/** Writes the current session to localStorage, silently ignoring quota errors. */
function saveSession(data: SessionData): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // Private-mode or quota exceeded – silently ignored.
  }
}

/** Removes the persisted session from localStorage. */
function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseGoalSessionReturn {
  appState: AppState;
  isLoading: boolean;
  goal: string;
  steps: MicroWin[];
  currentStep: number;
  completedCount: number;
  reviewSteps: MicroWin[];
  handleGoalSubmit: (goalText: string) => Promise<void>;
  handleReviewStepChange: (idx: number, value: string) => void;
  handleReviewStepDelete: (idx: number) => void;
  handleReviewRegenerate: () => void;
  handleReviewStart: () => void;
  handleStepComplete: () => Promise<void>;
  handleSkip: () => Promise<void>;
  handleReset: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages the entire goal-session lifecycle: AI decomposition, editable review,
 * step-by-step progress, streak updates, and localStorage persistence.
 *
 * @param profile - Current user profile (null when guest).
 * @param updateProfile - Async function to persist profile changes to Supabase.
 * @returns State values and event handlers consumed by Index.tsx.
 */
export function useGoalSession(
  profile: UserProfile | null,
  updateProfile: (updates: Partial<UserProfile>) => Promise<unknown>
): UseGoalSessionReturn {
  // Only restore a session that was mid-progress ("working"). Restoring a
  // "review" session is intentionally skipped because the AI data may be stale.
  const saved = (() => {
    const s = loadSession();
    return s?.appState === "working" ? s : null;
  })();

  const [appState, setAppState] = useState<AppState>(saved?.appState ?? "input");
  const [isLoading, setIsLoading] = useState(false);
  const [goal, setGoal] = useState(saved?.goal ?? "");
  const [steps, setSteps] = useState<MicroWin[]>(saved?.steps ?? []);
  const [currentStep, setCurrentStep] = useState(saved?.currentStep ?? 0);
  const [completedCount, setCompletedCount] = useState(saved?.completedCount ?? 0);
  const [reviewSteps, setReviewSteps] = useState<MicroWin[]>([]);

  // Only persist when the user is actively mid-session ("working").
  // For every other state, remove any stale entry so a page refresh
  // always starts clean unless there was genuine in-progress work.
  useEffect(() => {
    if (appState === "working") {
      saveSession({ goal, steps, currentStep, completedCount, appState });
    } else {
      clearSession();
    }
  }, [goal, steps, currentStep, completedCount, appState]);

  // -------------------------------------------------------------------------
  // Streak helpers
  // -------------------------------------------------------------------------

  /** Updates the streak for whichever context (Supabase or localStorage). */
  async function updateStreak(): Promise<void> {
    if (profile) {
      const newCount = calculateNextStreak(profile);
      const today = new Date().toISOString().split("T")[0];
      await updateProfile({ streak_count: newCount, last_streak_date: today });
    } else {
      incrementLocalStreak();
    }
  }

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  /** Calls the decompose-goal Edge Function and transitions to the review screen. */
  async function handleGoalSubmit(goalText: string): Promise<void> {
    setIsLoading(true);
    setGoal(goalText);

    // Extract personalisation fields from profile, falling back to neutral defaults
    // for guests who haven't set preferences.
    const supportNotes = profile?.support_notes ?? null;
    const preferredStepCount = profile?.preferred_step_count ?? 5;

    try {
      const { data, error } = await supabase.functions.invoke("decompose-goal", {
        body: {
          goal: goalText,
          supportNotes,
          preferredStepCount,
        },
      });

      if (error) throw error;

      const result = data as DecomposeGoalResponse;
      if (result.error) throw new Error(result.error);
      if (result.fallback) {
        toast.info("Using template steps — AI is taking a breather. You've got this! 🌱", { duration: 4000 });
      }

      const generated: MicroWin[] = result.steps ?? [];

      // Edge-case: AI returned no steps.
      if (generated.length === 0) {
        toast.warning(
          "Hmm, we couldn't break that down — try rephrasing your goal a little. 🤔",
          { duration: 5000 }
        );
        setIsLoading(false);
        return;
      }

      // Edge-case: AI returned only one step — valid but worth a nudge.
      if (generated.length === 1) {
        toast.info(
          "Just one step for this goal — that's totally fine, let's crush it! 🎯",
          { duration: 4000 }
        );
      }

      setSteps(generated);
      setCurrentStep(0);
      setCompletedCount(0);
      setReviewSteps(generated.map((s) => ({ ...s })));
      setAppState("review");
    } catch (err) {
      console.error("Failed to decompose goal:", err);
      toast.error(
        getErrorMessage(err, "Something went sideways — let's try breaking down your goal again!")
      );
    } finally {
      setIsLoading(false);
    }
  }

  /** Updates the text of a single review step by index. */
  function handleReviewStepChange(idx: number, value: string): void {
    setReviewSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, step: value } : s)));
  }

  /** Removes a review step by index (minimum 1 step enforced in the UI). */
  function handleReviewStepDelete(idx: number): void {
    setReviewSteps((prev) => prev.filter((_, i) => i !== idx));
  }

  /** Re-submits the goal to get a fresh AI decomposition. */
  function handleReviewRegenerate(): void {
    handleGoalSubmit(goal);
  }

  /** Commits the (possibly edited) review steps and begins the working state. */
  function handleReviewStart(): void {
    setSteps(reviewSteps);
    setCurrentStep(0);
    setCompletedCount(0);
    setAppState("working");
  }

  /** Marks the current step as done and advances or completes the session. */
  async function handleStepComplete(): Promise<void> {
    setCompletedCount((prev) => prev + 1);

    if (currentStep >= steps.length - 1) {
      await updateStreak();
      clearSession();
      setAppState("complete");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  /** Skips the current step and advances or completes the session. */
  async function handleSkip(): Promise<void> {
    if (currentStep >= steps.length - 1) {
      await updateStreak();
      clearSession();
      setAppState("complete");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  /** Clears all session state and returns to the input screen. */
  function handleReset(): void {
    clearSession();
    setAppState("input");
    setGoal("");
    setSteps([]);
    setCurrentStep(0);
    setCompletedCount(0);
  }

  return {
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
  };
}
