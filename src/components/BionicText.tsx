/** Props for the BionicText component. */
export interface BionicTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with the first ~40% of each word in bold (Bionic Reading).
 * Non-word tokens (spaces, punctuation, emojis) are passed through unchanged.
 *
 * @param text - The string to render with bionic formatting.
 * @param className - Optional CSS class forwarded to the wrapping `<span>`.
 */
const BionicText = ({ text, className }: BionicTextProps) => {
  // Split on whitespace boundaries, preserving the separators as tokens.
  const tokens = text.split(/(\s+)/);

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token) || token === "") {
          return <span key={i}>{token}</span>;
        }

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
