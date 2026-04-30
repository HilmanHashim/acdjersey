import { forwardRef, useRef, useState } from "react";
import { JerseyType, JerseyView, ZoneColors } from "./jerseyTemplates";
import Jersey3D from "./Jersey3D";
import { VectorComponents, VectorId } from "./vectorLibrary";
import { X } from "lucide-react";

export type PlacedVector = {
  id: string;
  vectorId: VectorId;
  x: number; // percent 0-100
  y: number; // percent 0-100
  scale: number; // 0.3 - 2.5
  color: string;
};

interface Props {
  type: JerseyType;
  view: JerseyView;
  colors: ZoneColors;
  vectors: PlacedVector[];
  selectedVectorId: string | null;
  onSelectVector: (id: string | null) => void;
  onMoveVector: (id: string, x: number, y: number) => void;
  onRemoveVector: (id: string) => void;
}

const JerseyCanvas = forwardRef<HTMLDivElement, Props>(
  ({ type, view, colors, vectors, selectedVectorId, onSelectVector, onMoveVector, onRemoveVector }, ref) => {
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
        className="relative w-full max-w-md aspect-[4/5] bg-muted/30 rounded-2xl border border-border overflow-hidden select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => onSelectVector(null)}
      >
        <div className="absolute inset-0">
          <Jersey3D type={type} colors={colors} view={view} />
        </div>

        {vectors.map((v) => {
          const VectorEl = VectorComponents[v.vectorId];
          const size = 80 * v.scale;
          const isSelected = v.id === selectedVectorId;
          return (
            <div
              key={v.id}
              onPointerDown={(e) => handlePointerDown(e, v.id)}
              onClick={(e) => { e.stopPropagation(); onSelectVector(v.id); }}
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
                  onClick={(e) => { e.stopPropagation(); onRemoveVector(v.id); }}
                  className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);
JerseyCanvas.displayName = "JerseyCanvas";

export default JerseyCanvas;
