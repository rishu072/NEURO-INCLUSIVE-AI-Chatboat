import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Timer } from "lucide-react";

import BionicText from "@/components/BionicText";
import {
  TIMER_BEEP_DURATION_S,
  TIMER_BEEP_FREQ_HZ,
  TIMER_BEEP_GAIN,
  TIMER_WARNING_THRESHOLD_S,
} from "@/lib/constants";
import { MicroWin } from "@/types";

// Re-export MicroWin so existing callers that import from this file keep working.
export type { MicroWin };

/** Props for the MicroWinCard component. */
export interface MicroWinCardProps {
  win: MicroWin;
  index: number;
  total: number;
  onComplete: () => void;
  onSkip: () => void;
  bionicReading?: boolean;
}

/**
 * Displays a single micro-win step with an auto-starting countdown timer.
 * Plays a subtle audio tone and shows a visual flash when the timer expires.
 * Does not auto-advance – user must click Done or Skip.
 */
const MicroWinCard = ({
  win,
  index,
  total,
  onComplete,
  onSkip,
  bionicReading = false,
}: MicroWinCardProps) => {
  const totalSeconds = win.duration * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Reset timer state whenever the step index or duration changes. */
  useEffect(() => {
    setSecondsLeft(win.duration * 60);
    setExpired(false);
  }, [index, win.duration]);

  /** Tick the timer down once per second; play a beep when it reaches zero. */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setExpired(true);

          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(TIMER_BEEP_FREQ_HZ, ctx.currentTime);
            gain.gain.setValueAtTime(TIMER_BEEP_GAIN, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + TIMER_BEEP_DURATION_S);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + TIMER_BEEP_DURATION_S);
          } catch {
            // AudioContext unavailable – silently ignored.
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

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const mmss = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  const timerColor =
    expired
      ? "text-red-500 animate-pulse"
      : secondsLeft <= TIMER_WARNING_THRESHOLD_S
      ? "text-yellow-500"
      : "text-muted-foreground";

  const barColor =
    expired
      ? "bg-red-500"
      : secondsLeft <= TIMER_WARNING_THRESHOLD_S
      ? "bg-yellow-500"
      : "bg-primary";

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
          {/* Step label + countdown */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium tracking-widest uppercase mb-4">
            <span>Step {index + 1} of {total} · ~{win.duration} min</span>
            <span
              className={`flex items-center gap-1.5 font-mono tabular-nums transition-colors ${timerColor}`}
              title={expired ? "Time's up!" : "Time remaining"}
            >
              <Timer className="h-3 w-3" />
              {mmss}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-muted rounded-full mb-6 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Step text */}
          <p className="text-xl font-medium text-foreground leading-relaxed mb-8">
            {bionicReading ? <BionicText text={win.step} /> : win.step}
          </p>

          {/* Expiry notification */}
          {expired && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-500 font-medium text-center"
            >
              ⏰ Time&apos;s up! Take your time — complete or skip when ready.
            </motion.div>
          )}

          {/* Actions */}
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
