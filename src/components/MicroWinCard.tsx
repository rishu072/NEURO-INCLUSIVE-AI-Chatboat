// FIXED: Added countdown timer based on step `duration`, bionic text prop,
// and subtle audio/visual cue when timer reaches zero.

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Timer } from "lucide-react";
import BionicText from "@/components/BionicText";

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
  bionicReading?: boolean;
}

const MicroWinCard = ({ win, index, total, onComplete, onSkip, bionicReading = false }: MicroWinCardProps) => {
  // FIXED: Countdown timer – starts automatically when card mounts, counts down from duration (minutes)
  const totalSeconds = win.duration * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer when the step changes
  useEffect(() => {
    setSecondsLeft(win.duration * 60);
    setExpired(false);
  }, [index, win.duration]);

  // Tick down
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setExpired(true);
          // FIXED: Subtle audio cue via Web Audio API when timer hits 0
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 1.2);
          } catch {
            // AudioContext not available – silently ignore
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [index, win.duration]);

  // Format mm:ss
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const mmss = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Progress fraction (for ring/bar)
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

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
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium tracking-widest uppercase mb-4">
            <span>Step {index + 1} of {total} · ~{win.duration} min</span>

            {/* FIXED: mm:ss countdown timer display with expiry flash */}
            <span
              className={`flex items-center gap-1.5 font-mono tabular-nums transition-colors ${
                expired
                  ? "text-red-500 animate-pulse"
                  : secondsLeft <= 30
                  ? "text-yellow-500"
                  : "text-muted-foreground"
              }`}
              title={expired ? "Time's up!" : "Time remaining"}
            >
              <Timer className="h-3 w-3" />
              {mmss}
            </span>
          </div>

          {/* FIXED: Thin progress bar shrinking with the timer */}
          <div className="w-full h-1 bg-muted rounded-full mb-6 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                expired ? "bg-red-500" : secondsLeft <= 30 ? "bg-yellow-500" : "bg-primary"
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <p className="text-xl font-medium text-foreground leading-relaxed mb-8">
            {/* FIXED: Conditionally render BionicText when bionicReading prop is true */}
            {bionicReading ? <BionicText text={win.step} /> : win.step}
          </p>

          {/* FIXED: Visual "Time's up!" notification when timer expires – non-blocking */}
          {expired && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-500 font-medium text-center"
            >
              ⏰ Time's up! Take your time — complete or skip when ready.
            </motion.div>
          )}

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
