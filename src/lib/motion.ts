/**
 * Motion transition helpers.
 *
 * Use `getTransition` everywhere instead of hardcoding `transition={{ duration: X }}`
 * so that the Reduced Motion preference is honoured throughout the app.
 *
 * Usage:
 *   import { getTransition } from "@/lib/motion";
 *   <motion.div transition={getTransition(reducedMotion, { duration: 0.35, ease: "easeOut" })} />
 */

/**
 * Returns a Framer Motion transition object.
 * When `reducedMotion` is true, the duration (and delay, if present) are set
 * to 0 so that all animations are instantaneous.
 *
 * @param reducedMotion - Whether the user has requested reduced motion.
 * @param base          - The normal transition object (duration, ease, delay, …).
 */
export function getTransition(
  reducedMotion: boolean,
  base: Record<string, unknown>
): Record<string, unknown> {
  if (!reducedMotion) return base;
  return { ...base, duration: 0, delay: 0 };
}

/**
 * Convenience wrapper that returns `initial` / `animate` / `exit` / `transition`
 * props merged into one object, with reduced motion applied.
 *
 * @param reducedMotion - Whether the user has requested reduced motion.
 * @param variants      - Object containing `initial`, `animate`, `exit`, and `transition` keys.
 */
export function getMotionProps(
  reducedMotion: boolean,
  variants: {
    initial?: Record<string, unknown>;
    animate?: Record<string, unknown>;
    exit?: Record<string, unknown>;
    transition?: Record<string, unknown>;
  }
): typeof variants {
  const { transition, ...rest } = variants;
  return {
    ...rest,
    transition: transition ? getTransition(reducedMotion, transition) : { duration: 0 },
  };
}
