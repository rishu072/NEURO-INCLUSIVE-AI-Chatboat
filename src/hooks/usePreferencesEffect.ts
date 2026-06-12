/**
 * usePreferencesEffect
 * Applies a UserProfile's accessibility/theme preferences to the DOM.
 * Extracted from Index.tsx to keep that file focused on rendering.
 */

import { useEffect } from "react";

import {
  ACCENT_HSL_MAP,
  MOTION_DURATION_DEFAULT,
  MOTION_DURATION_REDUCED,
} from "@/lib/constants";
import { UserProfile } from "@/types";

/**
 * Subscribes to `profile` changes and writes the corresponding CSS classes /
 * custom properties onto `<html>` and `<body>`.
 *
 * @param profile - Current user profile, or null when not logged in.
 */
export function usePreferencesEffect(profile: UserProfile | null): void {
  useEffect(() => {
    if (!profile) return;

    // Theme
    document.documentElement.classList.toggle("dark", profile.theme === "dark");

    // Font family — only one font class active at a time.
    document.body.classList.toggle("font-dyslexic", profile.font_preference === "dyslexic");
    document.body.classList.toggle("font-lexend", profile.font_preference === "lexend");

    // Font size
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
    if (profile.font_size === "small") document.documentElement.classList.add("text-sm");
    else if (profile.font_size === "large") document.documentElement.classList.add("text-lg");

    // Reduced motion
    document.documentElement.style.setProperty(
      "--motion-duration",
      profile.reduced_motion ? MOTION_DURATION_REDUCED : MOTION_DURATION_DEFAULT
    );

    // High contrast
    document.documentElement.classList.toggle("high-contrast", profile.high_contrast);

    // Accent color CSS variables
    const hsl = ACCENT_HSL_MAP[profile.accent_color];
    if (hsl) {
      document.documentElement.style.setProperty("--primary", hsl);
      document.documentElement.style.setProperty("--ring", hsl);
    }
  }, [profile]);
}
