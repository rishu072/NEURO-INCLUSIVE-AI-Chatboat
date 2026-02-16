import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, RotateCcw } from "lucide-react";

export interface MicroWin {
  step: string;
  duration: number;
}

interface MicroWinCardProps {
  win: MicroWin;
  index: number;
  total: number;
  onComplete: () => void;
  onSkip: () => void;
}

const MicroWinCard = ({ win, index, total, onComplete, onSkip }: MicroWinCardProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0, x: 40, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -40, scale: 0.95 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="rounded-xl border border-border bg-card p-8 shadow-soft">
          <div className="text-xs text-muted-foreground font-medium tracking-widest uppercase mb-4">
            Step {index + 1} of {total} · ~{win.duration} min
          </div>

          <p className="text-xl font-medium text-foreground leading-relaxed mb-8">
            {win.step}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onComplete}
              className="flex-1 gradient-calm text-primary-foreground rounded-lg py-3 px-6 font-medium flex items-center justify-center gap-2 hover:shadow-glow transition-all active:scale-[0.98]"
            >
              <Check className="h-4 w-4" />
              Done
            </button>
            <button
              onClick={onSkip}
              className="rounded-lg py-3 px-4 border border-border text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Skip step"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MicroWinCard;
