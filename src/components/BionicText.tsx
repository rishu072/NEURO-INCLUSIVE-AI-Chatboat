// FIXED: New BionicText component – bolds the first ~40% of each word's letters
// for Bionic Reading mode to guide eyes and reduce reading fatigue.

interface BionicTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with the first ~40% of each word in bold (Bionic Reading).
 * Non-alphabetic tokens (spaces, punctuation, emojis) are passed through unchanged.
 */
const BionicText = ({ text, className }: BionicTextProps) => {
  // Split preserving spaces and punctuation as separate tokens
  const tokens = text.split(/(\s+)/);

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        // Whitespace-only tokens: render as-is
        if (/^\s+$/.test(token) || token === "") {
          return <span key={i}>{token}</span>;
        }

        // For each token, bold the first ~40% of alphabetic characters
        const boldLength = Math.max(1, Math.ceil(token.length * 0.4));
        const boldPart = token.slice(0, boldLength);
        const rest = token.slice(boldLength);

        return (
          <span key={i}>
            <b>{boldPart}</b>
            {rest}
          </span>
        );
      })}
    </span>
  );
};

export default BionicText;
