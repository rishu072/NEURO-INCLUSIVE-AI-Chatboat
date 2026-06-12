/**
 * Shared TypeScript types for the NeuroAI micro-wins application.
 * Import from here instead of scattering type definitions across files.
 */

/** A single AI-generated or template-generated micro-win step. */
export interface MicroWin {
  step: string;
  duration: number; // minutes
}

/** Response shape returned by the decompose-goal Supabase Edge Function. */
export interface DecomposeGoalResponse {
  steps: MicroWin[];
  /** True when the AI gateway was unavailable and template steps were used. */
  fallback?: boolean;
  error?: string;
}

/** OpenAI-compatible chat-completion response from the Lovable AI gateway. */
export interface AiGatewayResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/** The four possible states of the goal-session flow. */
export type AppState = "input" | "review" | "working" | "complete";

/** Shape of the data persisted in localStorage under SESSION_KEY. */
export interface SessionData {
  goal: string;
  steps: MicroWin[];
  currentStep: number;
  completedCount: number;
  appState: AppState;
}

/** User profile stored in Supabase (mirrors the `profiles` DB table). */
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  theme: string;
  accent_color: string;
  steps_per_session: number;
  timer_duration: number;
  break_reminders: boolean;
  font_preference: string;
  font_size: string;
  reduced_motion: boolean;
  high_contrast: boolean;
  bionic_reading: boolean;
  streak_count: number;
  last_streak_date: string | null;
}
