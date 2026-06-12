import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import {
  Sun, Moon, Palette, Timer, Hash, Bell, BellOff,
  Type, ZoomIn, Accessibility, Eye, ArrowLeft, Save, Loader2, BookOpen,
} from "lucide-react";

const accentOptions = [
  { value: "sage", label: "Sage", hsl: "152 35% 45%" },
  { value: "amber", label: "Amber", hsl: "35 60% 60%" },
  { value: "ocean", label: "Ocean", hsl: "210 50% 50%" },
  { value: "lavender", label: "Lavender", hsl: "270 40% 60%" },
  { value: "coral", label: "Coral", hsl: "10 60% 55%" },
];

const Preferences = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("sage");
  const [stepsPerSession, setStepsPerSession] = useState(5);
  const [timerDuration, setTimerDuration] = useState(5);
  const [breakReminders, setBreakReminders] = useState(true);
  const [fontPreference, setFontPreference] = useState("lexend");
  const [fontSize, setFontSize] = useState("medium");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  // FIXED: Added bionic_reading preference state
  const [bionicReading, setBionicReading] = useState(false);

  useEffect(() => {
    if (profile) {
      setTheme(profile.theme);
      setAccentColor(profile.accent_color);
      setStepsPerSession(profile.steps_per_session);
      setTimerDuration(profile.timer_duration);
      setBreakReminders(profile.break_reminders);
      setFontPreference(profile.font_preference);
      setFontSize(profile.font_size);
      setReducedMotion(profile.reduced_motion);
      setHighContrast(profile.high_contrast);
      // FIXED: Load bionic_reading from profile (default false if undefined)
      setBionicReading(profile.bionic_reading ?? false);
    }
  }, [profile]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({
      theme,
      accent_color: accentColor,
      steps_per_session: stepsPerSession,
      timer_duration: timerDuration,
      break_reminders: breakReminders,
      font_preference: fontPreference,
      font_size: fontSize,
      reduced_motion: reducedMotion,
      high_contrast: highContrast,
      // FIXED: Save bionic_reading preference
      bionic_reading: bionicReading,
    });
    if (result?.error) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Preferences saved!");
      navigate("/");
    }
    setSaving(false);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      {children}
    </div>
  );

  const OptionButton = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-6 py-4 max-w-2xl mx-auto">
        <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Preferences</h1>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-6 pb-12 space-y-6"
      >
        {/* Theme */}
        <Section title="Theme & Colors" icon={Palette}>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Mode</p>
            <div className="flex gap-3">
              <OptionButton selected={theme === "light"} onClick={() => setTheme("light")}>
                <span className="flex items-center gap-2"><Sun className="h-3.5 w-3.5" /> Light</span>
              </OptionButton>
              <OptionButton selected={theme === "dark"} onClick={() => setTheme("dark")}>
                <span className="flex items-center gap-2"><Moon className="h-3.5 w-3.5" /> Dark</span>
              </OptionButton>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Accent Color</p>
            <div className="flex gap-3 flex-wrap">
              {accentOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAccentColor(opt.value)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    accentColor === opt.value
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${opt.hsl})` }} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Focus */}
        <Section title="Focus Preferences" icon={Timer}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-3.5 w-3.5" /> Steps per session
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={stepsPerSession}
                  onChange={(e) => setStepsPerSession(Number(e.target.value))}
                  className="w-24 accent-primary"
                />
                <span className="text-sm font-medium text-foreground w-6 text-right">{stepsPerSession}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Timer className="h-3.5 w-3.5" /> Timer duration (min)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(Number(e.target.value))}
                  className="w-24 accent-primary"
                />
                <span className="text-sm font-medium text-foreground w-6 text-right">{timerDuration}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Break reminders</label>
              <button
                type="button"
                onClick={() => setBreakReminders(!breakReminders)}
                className={`p-2 rounded-lg border transition-all ${
                  breakReminders ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
              >
                {breakReminders ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </Section>

        {/* Accessibility */}
        <Section title="Accessibility" icon={Accessibility}>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Type className="h-3.5 w-3.5" /> Font
              </p>
              <div className="flex gap-3">
                <OptionButton selected={fontPreference === "lexend"} onClick={() => setFontPreference("lexend")}>
                  Lexend
                </OptionButton>
                <OptionButton selected={fontPreference === "dyslexic"} onClick={() => setFontPreference("dyslexic")}>
                  OpenDyslexic
                </OptionButton>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <ZoomIn className="h-3.5 w-3.5" /> Font Size
              </p>
              <div className="flex gap-3">
                {["small", "medium", "large"].map((size) => (
                  <OptionButton key={size} selected={fontSize === size} onClick={() => setFontSize(size)}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </OptionButton>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Accessibility className="h-3.5 w-3.5" /> Reduced motion
              </label>
              <button
                type="button"
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                  reducedMotion ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
              >
                {reducedMotion ? "On" : "Off"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" /> High contrast
              </label>
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                  highContrast ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
              >
                {highContrast ? "On" : "Off"}
              </button>
            </div>
            {/* FIXED: Bionic Reading toggle – matches existing reduced_motion / high_contrast style */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5" /> Bionic reading
              </label>
              <button
                type="button"
                onClick={() => setBionicReading(!bionicReading)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                  bionicReading ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
              >
                {bionicReading ? "On" : "Off"}
              </button>
            </div>
          </div>
        </Section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-calm text-primary-foreground rounded-lg py-3 font-medium flex items-center justify-center gap-2 hover:shadow-glow transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Preferences</>}
        </button>
      </motion.main>
    </div>
  );
};

export default Preferences;
