import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

interface GoalInputProps {
  onSubmit: (goal: string) => void;
  isLoading: boolean;
}

const GoalInput = ({ onSubmit, isLoading }: GoalInputProps) => {
  const [goal, setGoal] = useState("");
  const [validationMsg, setValidationMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: already loading — do nothing (belt-and-suspenders alongside disabled attr).
    if (isLoading) return;

    // Validate non-empty.
    if (!goal.trim()) {
      setValidationMsg("Please share a goal first — even a small one counts! 🌱");
      return;
    }

    setValidationMsg("");
    onSubmit(goal.trim());
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-xl mx-auto"
    >
      <label
        htmlFor="goal-input"
        className="block text-sm font-semibold text-foreground mb-2"
      >
        Your goal
      </label>
      <p className="text-sm text-muted-foreground mb-4">
        Share anything you want to finish. We will break it into quick, doable steps.
      </p>
      <div className="relative">
        <textarea
          id="goal-input"
          value={goal}
          onChange={(e) => {
            setGoal(e.target.value);
            // Clear validation message as soon as the user starts typing.
            if (validationMsg) setValidationMsg("");
          }}
          placeholder="e.g. Outline a newsletter about focus rituals"
          rows={3}
          className="w-full rounded-xl border border-border bg-background/80 p-4 pr-14 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-base leading-relaxed transition-shadow shadow-soft"
          disabled={isLoading}
          aria-describedby={validationMsg ? "goal-validation" : undefined}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute bottom-3 right-3 gradient-calm rounded-lg p-2.5 text-primary-foreground disabled:opacity-40 transition-all hover:shadow-glow active:scale-95"
          aria-label={isLoading ? "Decomposing goal…" : "Decompose goal"}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Validation message */}
      <AnimatePresence>
        {validationMsg && (
          <motion.p
            id="goal-validation"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-amber-500 dark:text-amber-400"
          >
            {validationMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Loading status label */}
      <AnimatePresence>
        {isLoading && (
          <motion.p
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            Breaking this down for you…
          </motion.p>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

export default GoalInput;
