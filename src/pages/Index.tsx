import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import GoalInput from "@/components/GoalInput";
import MicroWinCard, { MicroWin } from "@/components/MicroWinCard";
import ProgressBar from "@/components/ProgressBar";
import StreakCounter from "@/components/StreakCounter";
import CompletionScreen from "@/components/CompletionScreen";
import { Settings, LogOut, LogIn, User } from "lucide-react";

type AppState = "input" | "working" | "complete";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [appState, setAppState] = useState<AppState>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [goal, setGoal] = useState("");
  const [steps, setSteps] = useState<MicroWin[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Apply user preferences to the DOM
  useEffect(() => {
    if (!profile) return;

    // Theme
    document.documentElement.classList.toggle("dark", profile.theme === "dark");

    // Font
    document.body.classList.toggle("font-dyslexic", profile.font_preference === "dyslexic");

    // Font size
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
    if (profile.font_size === "small") document.documentElement.classList.add("text-sm");
    else if (profile.font_size === "large") document.documentElement.classList.add("text-lg");

    // Reduced motion
    document.documentElement.style.setProperty(
      "--motion-duration",
      profile.reduced_motion ? "0s" : "0.35s"
    );

    // High contrast
    document.documentElement.classList.toggle("high-contrast", profile.high_contrast);

    // Accent color
    const accents: Record<string, string> = {
      sage: "152 35% 45%",
      amber: "35 60% 60%",
      ocean: "210 50% 50%",
      lavender: "270 40% 60%",
      coral: "10 60% 55%",
    };
    if (accents[profile.accent_color]) {
      document.documentElement.style.setProperty("--primary", accents[profile.accent_color]);
      document.documentElement.style.setProperty("--ring", accents[profile.accent_color]);
    }
  }, [profile]);

  // Local streak for non-logged-in users
  const getLocalStreak = (): number => {
    const data = localStorage.getItem("microwin-streak");
    if (!data) return 0;
    const { count, lastDate } = JSON.parse(data);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === today || lastDate === yesterday) return count;
    return 0;
  };

  const streak = profile ? profile.streak_count : getLocalStreak();

  const handleGoalSubmit = async (goalText: string) => {
    setIsLoading(true);
    setGoal(goalText);

    try {
      const { data, error } = await supabase.functions.invoke("decompose-goal", {
        body: { goal: goalText },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSteps(data.steps);
      setCurrentStep(0);
      setCompletedCount(0);
      setAppState("working");
    } catch (err: any) {
      console.error("Failed to decompose goal:", err);
      toast.error(err.message || "Failed to break down your goal. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStreak = async () => {
    const today = new Date().toISOString().split("T")[0];
    if (profile) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newCount =
        profile.last_streak_date === today
          ? profile.streak_count
          : profile.last_streak_date === yesterday
            ? profile.streak_count + 1
            : 1;
      await updateProfile({ streak_count: newCount, last_streak_date: today });
      return newCount;
    }
    // Local fallback
    const data = localStorage.getItem("microwin-streak");
    const todayStr = new Date().toDateString();
    if (!data) {
      localStorage.setItem("microwin-streak", JSON.stringify({ count: 1, lastDate: todayStr }));
      return 1;
    }
    const { count, lastDate } = JSON.parse(data);
    if (lastDate === todayStr) return count;
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
    const newCount = lastDate === yesterdayStr ? count + 1 : 1;
    localStorage.setItem("microwin-streak", JSON.stringify({ count: newCount, lastDate: todayStr }));
    return newCount;
  };

  const handleStepComplete = async () => {
    const newCompleted = completedCount + 1;
    setCompletedCount(newCompleted);

    if (currentStep >= steps.length - 1) {
      await updateStreak();
      setAppState("complete");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    if (currentStep >= steps.length - 1) {
      await updateStreak();
      setAppState("complete");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setAppState("input");
    setGoal("");
    setSteps([]);
    setCurrentStep(0);
    setCompletedCount(0);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-backdrop" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" aria-hidden="true" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full relative">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-foreground tracking-tight display-font"
        >
          micro<span className="text-primary">wins</span>
        </motion.h1>
        <div className="flex items-center gap-2">
          <StreakCounter streak={streak} />
          {user ? (
            <>
              <button
                onClick={() => navigate("/preferences")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Preferences"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-6 pb-20 pt-10 sm:pt-14 lg:pt-16 relative">
        {appState === "input" && (
          <div className="w-full max-w-5xl mx-auto">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Tiny wins, real momentum
                </div>
                <h2 className="mt-6 text-4xl sm:text-5xl font-semibold text-foreground leading-tight display-font">
                  Turn big goals into small, unstoppable moves.
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl">
                  Drop in your ambition and we will turn it into a clean, focused sequence you can finish in minutes.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-foreground">
                    Focused steps
                  </span>
                  <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-foreground">
                    Momentum tracking
                  </span>
                  <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-foreground">
                    No fluff, just progress
                  </span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 shadow-soft backdrop-blur"
              >
                <GoalInput onSubmit={handleGoalSubmit} isLoading={isLoading} />
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Average plan time: under 30 seconds</span>
                  <span>Private by default</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {appState === "working" && (
          <div className="w-full max-w-3xl mx-auto space-y-8">
            <div className="rounded-2xl border border-border/70 bg-card/80 p-6 sm:p-8 shadow-soft backdrop-blur space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Working on</p>
                <h2 className="text-lg font-semibold text-foreground truncate max-w-md mx-auto">
                  {goal}
                </h2>
              </div>
              <ProgressBar current={completedCount} total={steps.length} />
            </div>
            <MicroWinCard
              win={steps[currentStep]}
              index={currentStep}
              total={steps.length}
              onComplete={handleStepComplete}
              onSkip={handleSkip}
            />
          </div>
        )}

        {appState === "complete" && (
          <div className="w-full max-w-3xl mx-auto">
            <CompletionScreen
              goalTitle={goal}
              totalSteps={steps.length}
              onReset={handleReset}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
