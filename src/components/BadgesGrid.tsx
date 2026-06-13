/**
 * BadgesGrid
 *
 * Shows all available badges on the Preferences page.
 * Earned badges appear fully coloured; locked ones are greyed out with a lock icon.
 */

import {
  Flame,
  Footprints,
  Lock,
  Medal,
  Moon,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

import { BADGES } from "@/lib/badges";

// ---------------------------------------------------------------------------
// Icon resolver (same mapping as BadgeUnlock)
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Footprints,
  Trophy,
  Flame,
  Zap,
  Medal,
  Moon,
};

function BadgeIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Trophy;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BadgesGridProps {
  /** Badge IDs the user has already earned. */
  earnedIds: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const BadgesGrid = ({ earnedIds }: BadgesGridProps) => {
  const earnedSet = new Set(earnedIds);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {BADGES.map((badge) => {
        const earned = earnedSet.has(badge.id);
        return (
          <div
            key={badge.id}
            title={earned ? badge.description : "Keep going to unlock this badge!"}
            className={[
              "relative rounded-xl border p-4 flex flex-col items-center gap-2 text-center transition-all",
              earned
                ? "border-primary/40 bg-primary/5 shadow-sm"
                : "border-border bg-muted/30 opacity-50",
            ].join(" ")}
            aria-label={`${badge.name} — ${earned ? "earned" : "locked"}`}
          >
            {/* Icon */}
            <div
              className={[
                "h-11 w-11 rounded-xl flex items-center justify-center",
                earned ? "gradient-calm shadow-md" : "bg-muted",
              ].join(" ")}
            >
              {earned ? (
                <BadgeIcon
                  name={badge.icon}
                  className="h-5 w-5 text-primary-foreground"
                />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Name */}
            <p
              className={[
                "text-xs font-semibold leading-tight",
                earned ? "text-foreground" : "text-muted-foreground",
              ].join(" ")}
            >
              {badge.name}
            </p>

            {/* Earned pill */}
            {earned && (
              <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                Earned
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BadgesGrid;
