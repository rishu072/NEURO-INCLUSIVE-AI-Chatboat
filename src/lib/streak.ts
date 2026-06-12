/**
 * Streak logic extracted from Index.tsx.
 * Handles both Supabase-backed (logged-in) and localStorage (guest) streaks.
 */

import { ONE_DAY_MS, STREAK_KEY } from "@/lib/constants";
import { UserProfile } from "@/types";

/** Shape of the streak record stored in localStorage for guest users. */
interface LocalStreakData {
  count: number;
  lastDate: string; // toDateString() format e.g. "Thu Jun 12 2026"
}

/**
 * Reads the current streak for a guest user from localStorage.
 * Returns 0 if there is no streak or if the streak has broken.
 */
export function getLocalStreak(): number {
  const raw = localStorage.getItem(STREAK_KEY);
  if (!raw) return 0;

  const { count, lastDate } = JSON.parse(raw) as LocalStreakData;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - ONE_DAY_MS).toDateString();

  if (lastDate === today || lastDate === yesterday) return count;
  return 0;
}

/**
 * Increments (or preserves) the guest streak in localStorage.
 * Called when a session is completed without a logged-in profile.
 *
 * @returns The new streak count.
 */
export function incrementLocalStreak(): number {
  const todayStr = new Date().toDateString();
  const raw = localStorage.getItem(STREAK_KEY);

  if (!raw) {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastDate: todayStr }));
    return 1;
  }

  const { count, lastDate } = JSON.parse(raw) as LocalStreakData;
  if (lastDate === todayStr) return count;

  const yesterdayStr = new Date(Date.now() - ONE_DAY_MS).toDateString();
  const newCount = lastDate === yesterdayStr ? count + 1 : 1;
  localStorage.setItem(STREAK_KEY, JSON.stringify({ count: newCount, lastDate: todayStr }));
  return newCount;
}

/**
 * Calculates the next streak count for a logged-in user based on their profile.
 *
 * @param profile - The current user profile from Supabase.
 * @returns The new streak count (unchanged if already updated today).
 */
export function calculateNextStreak(profile: UserProfile): number {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - ONE_DAY_MS).toISOString().split("T")[0];

  if (profile.last_streak_date === today) return profile.streak_count;
  if (profile.last_streak_date === yesterday) return profile.streak_count + 1;
  return 1;
}
