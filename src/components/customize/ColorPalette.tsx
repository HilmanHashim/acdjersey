import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Pipette } from "lucide-react";

/* Vibrant, jersey-friendly palette — grouped visually */
export const PALETTE_GROUPS: { label: string; colors: string[] }[] = [
  {
    label: "Neutrals",
    colors: ["#FFFFFF", "#E5E7EB", "#9CA3AF", "#4B5563", "#1F2937", "#000000"],
  },
  {
    label: "Reds & Warm",
    colors: ["#FF1744", "#E11D48", "#B91C1C", "#7F1D1D", "#F97316", "#FB923C"],
  },
  {
    label: "Yellows & Golds",
    colors: ["#FFD700", "#FBBF24", "#F59E0B", "#FACC15", "#D4AF37", "#A16207"],
  },
  {
    label: "Greens",
    colors: ["#22C55E", "#10B981", "#059669", "#065F46", "#84CC16", "#4D7C0F"],
  },
  {
    label: "Blues",
    colors: ["#06B6D4", "#0EA5E9", "#3B82F6", "#1D4ED8", "#1E3A8A", "#0F172A"],
  },
  {
    label: "Purples & Pinks",
    colors: ["#A855F7", "#7C3AED", "#6D28D9", "#EC4899", "#F43F5E", "#BE185D"],
  },
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
      {PALETTE_GROUPS.map((group) => (
        <div key={group.label} className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-display">
            {group.label}
          </p>
          <div className="grid grid-cols-8 gap-1">
            {group.colors.map((c) => {
              const active = selectedColor.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onPick(c)}
                  className={cn(
                    "relative aspect-square rounded transition-all duration-200 hover:scale-110",
                    active
                      ? "ring-2 ring-offset-1 ring-offset-card ring-accent shadow"
                      : "ring-1 ring-border/60 hover:ring-accent/60"
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${c} 0%, ${c} 60%, ${shade(c, -18)} 100%)`,
                    boxShadow: active
                      ? `0 0 12px ${c}55, inset 0 1px 1px rgba(255,255,255,0.25)`
                      : `inset 0 1px 1px rgba(255,255,255,0.18)`,
                  }}
                  aria-label={c}
                  title={c}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom hex picker */}
      <div className="pt-2 border-t border-border/50 space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-display flex items-center gap-1.5">
          <Pipette className="h-3 w-3" /> Custom Color
        </p>
        <div className="flex gap-1.5 items-center">
          <input
            type="color"
            value={hex.startsWith("#") ? hex : "#000000"}
            onChange={(e) => {
              setHex(e.target.value);
              onPick(e.target.value);
            }}
            className="h-8 w-8 rounded border border-border bg-background cursor-pointer p-0.5 shrink-0"
          />
          <Input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            placeholder="#hex"
            className="text-xs h-8 font-mono uppercase"
          />
          <button
            type="button"
            onClick={apply}
            className="text-[10px] px-2.5 h-8 rounded bg-gradient-to-br from-accent to-primary text-accent-foreground font-display uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};

/* tiny color shader: lighten/darken hex by percent (-100..100) */
function shade(hex: string, percent: number) {
  const h = hex.replace("#", "");
  const num = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16
  );
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const adj = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v + (percent / 100) * 255)));
  return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
}

export default ColorPalette;
