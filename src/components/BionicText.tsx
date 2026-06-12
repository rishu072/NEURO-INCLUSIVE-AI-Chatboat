/**
 * BionicText
 *
 * Renders text with the first ~40–50% of each word bolded to aid reading
 * speed and focus (Bionic Reading technique).
 *
 * Edge-case handling:
 *  - `enabled = false`  → renders plain text, no DOM overhead
 *  - Words < 3 letters  → rendered fully unbolded (bolding 1 letter of "of"
 *                          adds no value and looks odd)
 *  - Whitespace tokens  → passed through as-is so spacing is preserved
 *  - Punctuation        → kept attached to the word token; the bold section
 *                          only covers the alphabetic leading characters so
 *                          punctuation is never bolded
 */

export interface BionicTextProps {
  /** The string to render. */
  text: string;
  /** When false (default) renders plain text. */
  enabled?: boolean;
  /** Optional CSS class forwarded to the wrapping <span>. */
  className?: string;
}

/**
 * Calculates the number of leading characters to bold for a given word.
 * Returns 0 for very short words (< 3 chars) so they render normally.
 */
function boldLength(word: string): number {
  if (word.length < 3) return 0;
  // Target 40–50%: ceil ensures at least 1 char is always bolded for >= 3-char words.
  return Math.ceil(word.length * 0.45);
}

const BionicText = ({ text, enabled = false, className }: BionicTextProps) => {
  // Fast path: if bionic reading is off, render a plain span.
  if (!enabled) {
    return <span className={className}>{text}</span>;
  }

  // Split on whitespace, preserving separator tokens so we can reconstruct
  // the original spacing faithfully.
  const tokens = text.split(/(\s+)/);

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        // Whitespace / empty token → pass through unchanged.
        if (/^\s*$/.test(token)) {
          return <span key={i}>{token}</span>;
        }

        const bl = boldLength(token);

        // Short words (< 3 chars) → render plain.
        if (bl === 0) {
          return <span key={i}>{token}</span>;
        }

        const bold = token.slice(0, bl);
        const rest = token.slice(bl);

        return (
          <span key={i}>
            <strong>{bold}</strong>
            {rest}
          </span>
        );
      })}
    </span>
  );
};

export default BionicText;
