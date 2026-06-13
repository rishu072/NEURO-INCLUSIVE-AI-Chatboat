/**
 * BadgeUnlock
 *
 * Celebratory overlay card that appears when the user earns a new badge.
 * Renders each newly unlocked badge in a sequenced queue (one at a time).
 * Respects reduced_motion — when true, animations are instantaneous.
 *
 * Usage:
 *   <BadgeUnlock newBadgeIds={["first_step"]} reducedMotion={false} />
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flame,
  Footprints,
  Medal,
  Moon,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

import { BADGES, BadgeDefinition } from "@/lib/badges";
import { getTransition } from "@/lib/motion";

// ---------------------------------------------------------------------------
// Icon resolver — maps the string stored in BADGES to the real component
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

export interface BadgeUnlockProps {
  /** IDs of badges just unlocked in this action. May be empty. */
  newBadgeIds: string[];
  /** Whether the user has reduced motion enabled. */
  reducedMotion?: boolean;
  /** Called when the last notification is dismissed. */
  onDone?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const BadgeUnlock = ({
  newBadgeIds,
  reducedMotion = false,
  onDone,
}: BadgeUnlockProps) => {
  // Build an ordered queue of badge definitions to show one by one.
  const [queue, setQueue] = useState<BadgeDefinition[]>(() =>
    newBadgeIds
      .map((id) => BADGES.find((b) => b.id === id))
      .filter(Boolean) as BadgeDefinition[]
  );

  // Sync when new IDs are pushed in.
  useEffect(() => {
    const defs = newBadgeIds
      .map((id) => BADGES.find((b) => b.id === id))
      .filter(Boolean) as BadgeDefinition[];
    if (defs.length > 0) setQueue(defs);
  }, [newBadgeIds]);

  const current = queue[0] ?? null;

  function dismiss() {
    setQueue((prev) => {
      const next = prev.slice(1);
      if (next.length === 0) onDone?.();
      return next;
    });
  }

  // Auto-dismiss after 4 s.
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  return (
    <AnimatePresence>
      {current && (
        <>
          {/* Backdrop — subtle darkened overlay */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={getTransition(reducedMotion, { duration: 0.25 })}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden="true"
          />

          {/* Badge card */}
          <motion.div
            key={current.id}
            role="dialog"
            aria-modal="true"
            aria-label={`Badge unlocked: ${current.name}`}
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={getTransition(reducedMotion, {
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1], // spring-like overshoot
            })}
            className="fixed inset-x-0 bottom-10 z-50 mx-auto w-full max-w-sm px-4"
          >
            <div className="relative rounded-2xl border border-primary/40 bg-card shadow-glow overflow-hidden">
              {/* Shimmer strip */}
              {!reducedMotion && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ x: "-100%" }}
                  animate={{ x: "150%" }}
                  transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                  }}
                />
              )}

              <div className="relative p-5 flex items-start gap-4">
                {/* Icon blob */}
                <div className="flex-shrink-0 h-14 w-14 rounded-xl gradient-calm flex items-center justify-center shadow-md">
                  <BadgeIcon name={current.icon} className="h-7 w-7 text-primary-foreground" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-0.5">
                    Badge Unlocked!
                  </p>
                  <p className="text-base font-bold text-foreground leading-tight">
                    {current.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 leading-snug">
                    {current.description}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={dismiss}
                  className="flex-shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss badge notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Countdown progress bar */}
              <motion.div
                key={`${current.id}-progress`}
                className="h-0.5 bg-primary/60"
                initial={{ scaleX: 1, transformOrigin: "left" }}
                animate={{ scaleX: 0 }}
                transition={getTransition(reducedMotion, { duration: 4, ease: "linear" })}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BadgeUnlock;
