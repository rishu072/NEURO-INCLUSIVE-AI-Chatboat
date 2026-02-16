import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakCounterProps {
  streak: number;
}

const StreakCounter = ({ streak }: StreakCounterProps) => {
  if (streak === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 text-secondary font-semibold"
    >
      <Flame className="h-4 w-4" />
      <span className="text-sm">{streak} day streak</span>
    </motion.div>
  );
};

export default StreakCounter;
