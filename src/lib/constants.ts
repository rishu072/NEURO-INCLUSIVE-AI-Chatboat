/**
 * Application-wide constants.
 * Centralises all magic values so they are never duplicated across components.
 */

/** localStorage key used to persist the active goal session. */
export const SESSION_KEY = "neuroai-session";

/** localStorage key used to persist the local (guest) streak data. */
export const STREAK_KEY = "microwin-streak";

/** Milliseconds in one day – used for streak date arithmetic. */
export const ONE_DAY_MS = 86_400_000;

/**
 * Maps accent-color slug → HSL string (no `hsl()` wrapper).
 * Used both in the Preferences UI and in the DOM-effect that sets CSS variables.
 */
export const ACCENT_HSL_MAP: Record<string, string> = {
  sage: "152 35% 45%",
  amber: "35 60% 60%",
  ocean: "210 50% 50%",
  lavender: "270 40% 60%",
  coral: "10 60% 55%",
};

/** Ordered list of accent options for the Preferences colour picker. */
export const ACCENT_OPTIONS = [
  { value: "sage", label: "Sage", hsl: ACCENT_HSL_MAP.sage },
  { value: "amber", label: "Amber", hsl: ACCENT_HSL_MAP.amber },
  { value: "ocean", label: "Ocean", hsl: ACCENT_HSL_MAP.ocean },
  { value: "lavender", label: "Lavender", hsl: ACCENT_HSL_MAP.lavender },
  { value: "coral", label: "Coral", hsl: ACCENT_HSL_MAP.coral },
] as const;

/** Font-size Tailwind class names keyed by preference value. */
export const FONT_SIZE_CLASS: Record<string, string> = {
  small: "text-sm",
  medium: "",
  large: "text-lg",
};

/** Duration (seconds) of the timer audio beep tone. */
export const TIMER_BEEP_DURATION_S = 1.2;

/** Frequency (Hz) of the timer expiry oscillator tone. */
export const TIMER_BEEP_FREQ_HZ = 880;

/** Gain at which the timer beep plays (0–1 scale). */
export const TIMER_BEEP_GAIN = 0.15;

/** Seconds-left threshold below which the timer turns yellow (warning). */
export const TIMER_WARNING_THRESHOLD_S = 30;

/** Default motion-transition duration applied to the DOM CSS variable. */
export const MOTION_DURATION_DEFAULT = "0.35s";

/** Motion-transition duration when reduced motion is enabled. */
export const MOTION_DURATION_REDUCED = "0s";

/** Framer Motion animation delay for the hero text column (seconds). */
export const HERO_TEXT_DELAY = 0.1;

/** Framer Motion animation delay for the hero input card (seconds). */
export const HERO_CARD_DELAY = 0.15;
