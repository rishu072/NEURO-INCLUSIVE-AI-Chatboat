/**
 * Badge definitions and unlock logic.
 *
 * Each badge has:
 *  - id          – stable identifier stored in the DB
 *  - name        – short display name
 *  - description – flavour text shown in the BadgesGrid
 *  - icon        – Lucide icon name (string, resolved at render time)
 *  - condition   – pure function that receives current stats and returns true
 *                  when the badge should be considered earned
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BadgeStats {
  /** Total individual micro-win steps ever completed. */
  totalMicrowins: number;
  /** Total full goals (all steps finished / last step marked complete). */
  totalGoals: number;
  /** Current streak length in days. */
  streakCount: number;
  /** Hour (0–23) at which the most recent goal was completed (local time). */
  completionHour: number;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  /** Lucide icon component name, e.g. "Star", "Trophy", "Flame". */
  icon: string;
  condition: (stats: BadgeStats) => boolean;
}

// ---------------------------------------------------------------------------
// Badge catalogue
// ---------------------------------------------------------------------------

export const BADGES: BadgeDefinition[] = [
  {
    id: "first_step",
    name: "First Step",
    description: "Completed your very first micro-win. Every journey starts here! 🌱",
    icon: "Footprints",
    condition: (s) => s.totalMicrowins >= 1,
  },
  {
    id: "goal_getter",
    name: "Goal Getter",
    description: "Finished your first full goal from start to finish. You did it! 🎯",
    icon: "Trophy",
    condition: (s) => s.totalGoals >= 1,
  },
  {
    id: "streak_3",
    name: "3-Day Streak",
    description: "Showed up three days in a row. Momentum is building! 🔥",
    icon: "Flame",
    condition: (s) => s.streakCount >= 3,
  },
  {
    id: "streak_7",
    name: "7-Day Streak",
    description: "Seven consecutive days of wins. You're unstoppable! ⚡",
    icon: "Zap",
    condition: (s) => s.streakCount >= 7,
  },
  {
    id: "marathon",
    name: "Marathon",
    description: "Completed 10 total micro-wins. Small steps, big distances! 🏅",
    icon: "Medal",
    condition: (s) => s.totalMicrowins >= 10,
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Completed a goal after 9 pm. Late-night legends unite! 🦉",
    icon: "Moon",
    condition: (s) => s.completionHour >= 21,
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Returns the IDs of any badges newly earned given the current stats.
 * Already-earned badges (present in `currentBadgeIds`) are excluded.
 *
 * @param stats          - Up-to-date user stats AFTER the action that may
 *                         have triggered unlocks.
 * @param currentBadgeIds - Badge IDs already stored in the user's profile.
 */
export function checkNewBadges(
  stats: BadgeStats,
  currentBadgeIds: string[]
): string[] {
  const earned = new Set(currentBadgeIds);
  return BADGES
    .filter((b) => !earned.has(b.id) && b.condition(stats))
    .map((b) => b.id);
}
