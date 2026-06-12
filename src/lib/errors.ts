/**
 * Centralised error-message helper.
 * Import and use `getErrorMessage` instead of inline `err.message || "..."` patterns.
 *
 * All messages are intentionally encouraging / non-judgmental in tone so that
 * users with anxiety or executive-function challenges don't feel blamed for
 * technical failures outside their control.
 */

/** A curated set of encouraging fallback messages shown when no specific message
 *  is available. One is picked pseudo-randomly so the UI doesn't feel repetitive. */
const ENCOURAGING_FALLBACKS = [
  "Something went sideways — let's try that again 🙌",
  "Oops, that didn't quite work. No worries, give it another go!",
  "A small hiccup on our end — you're doing great, let's retry.",
  "That one slipped through. Ready when you are to try again!",
];

function pickFallback(): string {
  return ENCOURAGING_FALLBACKS[Math.floor(Math.random() * ENCOURAGING_FALLBACKS.length)];
}

/**
 * Extracts a human-readable, user-friendly message from any thrown value.
 *
 * @param err      - The caught value (may be an Error, a string, or anything else).
 * @param fallback - Optional override message when `err` carries no useful text.
 *                   If omitted, a randomly-chosen encouraging message is used.
 * @returns A non-empty string suitable for display in a toast or UI element.
 */
export function getErrorMessage(err: unknown, fallback?: string): string {
  const fb = fallback ?? pickFallback();

  if (err instanceof Error && err.message) {
    // Strip noisy technical prefixes (e.g. "Error: ", "TypeError: ").
    const cleaned = err.message.replace(/^(Error|TypeError|RangeError|SyntaxError):\s*/i, "");
    return cleaned || fb;
  }

  if (typeof err === "string" && err.trim()) return err.trim();

  return fb;
}
