/**
 * Centralised error-message helper.
 * Import and use `getErrorMessage` instead of inline `err.message || "..."` patterns.
 */

/**
 * Extracts a human-readable message from any thrown value.
 *
 * @param err - The caught value (may be an Error, a string, or anything else).
 * @param fallback - Message returned when `err` carries no useful text.
 * @returns A non-empty string suitable for display in a toast.
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}
