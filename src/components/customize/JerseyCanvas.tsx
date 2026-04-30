import { forwardRef, useRef, useState } from "react";
import { JerseyType, JerseyView, ZoneColors, JerseyTemplate } from "./jerseyTemplates";
import { VectorComponents, VectorId } from "./vectorLibrary";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlacedVector = {
  id: string;
  vectorId: VectorId;
  x: number;
  y: number;
  scale: number;
  color: string;
};

interface Props {
  type: JerseyType;
  view: JerseyView;
  onViewChange?: (v: JerseyView) => void;
  colors: ZoneColors;
  vectors: PlacedVector[];
  selectedVectorId: string | null;
  onSelectVector: (id: string | null) => void;
  onMoveVector: (id: string, x: number, y: number) => void;
  onRemoveVector: (id: string) => void;
}

const JerseyCanvas = forwardRef<HTMLDivElement, Props>(
  ({ type, view, onViewChange, colors, vectors, selectedVectorId, onSelectVector, onMoveVector, onRemoveVector }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<string | null>(null);

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      onSelectVector(id);
      setDragging(id);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };
    const handlePointerMove = (e: React.PointerEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onMoveVector(dragging, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
    };
    const handlePointerUp = () => setDragging(null);

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        onClick={() => onSelectVector(null)}
        className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden select-none border border-border/40 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)] flex items-center justify-center"
        style={{
          backgroundColor: "#eef0f3",
          backgroundImage: `
            radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.95) 0%, rgba(238,240,243,0) 60%),
            radial-gradient(circle at 12% 88%, hsl(var(--accent) / 0.12) 0%, transparent 45%),
            radial-gradient(circle at 88% 12%, hsl(var(--primary) / 0.10) 0%, transparent 45%),
            linear-gradient(135deg, transparent 49.6%, rgba(0,0,0,0.045) 49.6%, rgba(0,0,0,0.045) 50.4%, transparent 50.4%),
            linear-gradient(45deg, transparent 49.6%, rgba(0,0,0,0.045) 49.6%, rgba(0,0,0,0.045) 50.4%, transparent 50.4%)
          `,
          backgroundSize: "auto, auto, auto, 28px 28px, 28px 28px",
        }}
      >
        {/* Front / Back toggle pill (top center) */}
        {onViewChange && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/85 backdrop-blur border border-black/10 rounded-full p-1 shadow-md">
            {(["front", "back"] as JerseyView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewChange(v);
                }}
                className={cn(
                  "px-5 py-1.5 rounded-full font-display uppercase text-[11px] tracking-[0.18em] transition-all",
                  view === v
                    ? "bg-accent text-accent-foreground shadow"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {/* View label badge (bottom center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/70 backdrop-blur text-[10px] uppercase tracking-[0.2em] font-display text-neutral-500 border border-black/5">
          {view} view
        </div>

        {/* 2D vector jersey */}
        <div className="relative w-[min(75%,480px)] aspect-[4/5]">
          <JerseyTemplate type={type} colors={colors} view={view} />

          {/* Vector overlay */}
          <div
            className="absolute inset-0"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {vectors.map((v) => {
              const VectorEl = VectorComponents[v.vectorId];
              const size = 80 * v.scale;
              const isSelected = v.id === selectedVectorId;
              return (
                <div
                  key={v.id}
                  onPointerDown={(e) => handlePointerDown(e, v.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVector(v.id);
                  }}
                  className="absolute cursor-move touch-none"
                  style={{
                    left: `${v.x}%`,
                    top: `${v.y}%`,
                    width: size,
                    height: size,
                    transform: "translate(-50%, -50%)",
                    outline: isSelected ? "2px dashed hsl(var(--accent))" : "none",
                    outlineOffset: 4,
                  }}
                >
                  <VectorEl color={v.color} size={size} />
                  {isSelected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveVector(v.id);
                      }}
                      className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);
JerseyCanvas.displayName = "JerseyCanvas";

export default JerseyCanvas;
