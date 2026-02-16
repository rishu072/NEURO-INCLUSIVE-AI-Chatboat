import { motion } from "framer-motion";
import { Trophy, RotateCcw } from "lucide-react";

interface CompletionScreenProps {
  goalTitle: string;
  totalSteps: number;
  onReset: () => void;
}

const CompletionScreen = ({ goalTitle, totalSteps, onReset }: CompletionScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center max-w-md mx-auto"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-warm mb-6">
        <Trophy className="h-8 w-8 text-accent-foreground" />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Goal Complete! 🎉</h2>
      <p className="text-muted-foreground mb-2">
        You crushed <span className="text-foreground font-medium">"{goalTitle}"</span>
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        {totalSteps} micro-wins conquered
      </p>

      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-foreground font-medium hover:bg-muted transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
        New Goal
      </button>
    </motion.div>
  );
};

export default CompletionScreen;
