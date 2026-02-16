import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

interface GoalInputProps {
  onSubmit: (goal: string) => void;
  isLoading: boolean;
}

const GoalInput = ({ onSubmit, isLoading }: GoalInputProps) => {
  const [goal, setGoal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim() && !isLoading) {
      onSubmit(goal.trim());
    }
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
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Outline a newsletter about focus rituals"
          rows={3}
          className="w-full rounded-xl border border-border bg-background/80 p-4 pr-14 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-base leading-relaxed transition-shadow shadow-soft"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!goal.trim() || isLoading}
          className="absolute bottom-3 right-3 gradient-calm rounded-lg p-2.5 text-primary-foreground disabled:opacity-40 transition-all hover:shadow-glow active:scale-95"
          aria-label="Decompose goal"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </button>
      </div>
    </motion.form>
  );
};

export default GoalInput;
