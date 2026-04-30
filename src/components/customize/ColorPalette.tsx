import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const PALETTE = [
  "#FFFFFF", "#000000", "#6B7280", "#9CA3AF",
  "#DC2626", "#B91C1C", "#7F1D1D", "#F97316",
  "#FBBF24", "#FACC15", "#84CC16", "#16A34A",
  "#065F46", "#0EA5E9", "#1D4ED8", "#1E3A8A",
  "#7C3AED", "#DB2777", "#F43F5E", "#D4AF37",
];

interface Props {
  selectedColor: string;
  onPick: (hex: string) => void;
}

const ColorPalette = ({ selectedColor, onPick }: Props) => {
  const [hex, setHex] = useState(selectedColor);

  const apply = () => {
    if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)) onPick(hex);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onPick(c)}
            className={cn(
              "aspect-square rounded-md border-2 transition-all hover:scale-110",
              selectedColor.toLowerCase() === c.toLowerCase()
                ? "border-accent ring-2 ring-accent/40"
                : "border-border"
            )}
            style={{ backgroundColor: c }}
            aria-label={c}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          placeholder="#hex"
          className="text-xs h-8"
        />
        <button
          type="button"
          onClick={apply}
          className="text-xs px-3 rounded-md bg-accent text-accent-foreground font-display"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default ColorPalette;
