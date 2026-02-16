import { Type } from "lucide-react";

interface FontToggleProps {
  isDyslexic: boolean;
  onToggle: () => void;
}

const FontToggle = ({ isDyslexic, onToggle }: FontToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md border border-border px-3 py-1.5"
      aria-label={`Switch to ${isDyslexic ? "Lexend" : "OpenDyslexic"} font`}
    >
      <Type className="h-3.5 w-3.5" />
      <span>{isDyslexic ? "OpenDyslexic" : "Lexend"}</span>
    </button>
  );
};

export default FontToggle;
