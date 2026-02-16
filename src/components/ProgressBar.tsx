import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium">
        <span>{current} of {total} completed</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full gradient-calm rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
