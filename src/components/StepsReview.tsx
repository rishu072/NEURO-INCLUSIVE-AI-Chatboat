import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Play, Plus, RefreshCw, Trash2 } from "lucide-react";

import BionicText from "@/components/BionicText";
import { getTransition } from "@/lib/motion";
import { MicroWin } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface StepsReviewProps {
  /** The original goal text — displayed as the section heading. */
  goal: string;
  /** The current (potentially edited) list of steps. */
  steps: MicroWin[];
  /** Called when the user edits a step's text. */
  onStepChange: (idx: number, value: string) => void;
  /** Called when the user deletes a step. */
  onStepDelete: (idx: number) => void;
  /** Called when the user clicks "Add step". */
  onStepAdd: () => void;
  /** Called when the user clicks "Regenerate all". */
  onRegenerate: () => void;
  /** Called when the user clicks "Start". */
  onStart: () => void;
  /** True while the AI is regenerating steps. */
  isRegenerating: boolean;
  /** Whether bionic reading is active (forwards to goal title). */
  bionicReading?: boolean;
  /** Whether reduced motion is active. */
  reducedMotion?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders the editable review screen between goal decomposition and the
 * working session. Users can edit, delete, add, or regenerate steps before
 * committing with the "Start" button.
 */
const StepsReview = ({
  goal,
  steps,
  onStepChange,
  onStepDelete,
  onStepAdd,
  onRegenerate,
  onStart,
  isRegenerating,
  bionicReading = false,
  reducedMotion = false,
}: StepsReviewProps) => {
  // Auto-focus the last input whenever a new blank step is appended.
  const lastInputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef(steps.length);

  useEffect(() => {
    if (steps.length > prevLengthRef.current) {
      lastInputRef.current?.focus();
    }
    prevLengthRef.current = steps.length;
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getTransition(reducedMotion, { duration: 0.35 })}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* ── Header ── */}
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">Review your plan for</p>
        <h2 className="text-lg font-semibold text-foreground">
          <BionicText text={goal} enabled={bionicReading} />
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Edit, delete, or add steps — then hit{" "}
          <strong>Start</strong> when you're ready.
        </p>
      </div>

      {/* ── Editable step list ── */}
      <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-soft backdrop-blur space-y-3">
        <AnimatePresence initial={false}>
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10, height: 0, marginBottom: 0 }}
                transition={getTransition(reducedMotion, { duration: 0.22 })}
                className="flex items-start gap-3"
              >
                {/* Step number badge */}
                <span className="mt-2.5 text-xs text-muted-foreground font-mono w-5 shrink-0 text-right select-none">
                  {idx + 1}.
                </span>

                {/* Editable text */}
                <input
                  ref={isLast ? lastInputRef : undefined}
                  type="text"
                  value={step.step}
                  onChange={(e) => onStepChange(idx, e.target.value)}
                  placeholder="Describe this step…"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  aria-label={`Edit step ${idx + 1}`}
                />

                {/* Delete button — disabled when only 1 step remains */}
                <button
                  type="button"
                  onClick={() => onStepDelete(idx)}
                  disabled={steps.length <= 1}
                  className="mt-1.5 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={`Delete step ${idx + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ── Add step ── */}
        <motion.button
          type="button"
          onClick={onStepAdd}
          layout
          className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/50 transition-all w-full"
          aria-label="Add a new step"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          Add step
        </motion.button>
      </div>

      {/* ── Action row ── */}
      <div className="flex gap-3">
        {/* Regenerate */}
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          aria-label="Regenerate all steps"
        >
          {isRegenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRegenerating ? "Regenerating…" : "Regenerate all"}
        </button>

        {/* Start */}
        <button
          type="button"
          onClick={onStart}
          disabled={steps.length === 0 || isRegenerating}
          className="flex-1 gradient-calm text-primary-foreground rounded-lg py-2.5 px-6 font-medium flex items-center justify-center gap-2 hover:shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Start working through steps"
        >
          <Play className="h-4 w-4" />
          Start
        </button>
      </div>
    </motion.div>
  );
};

export default StepsReview;
