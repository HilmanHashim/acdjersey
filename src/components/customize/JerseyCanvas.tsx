import { forwardRef, useRef, useState } from "react";
import { JerseyType, JerseyView, ZoneColors } from "./jerseyTemplates";
import Jersey3D, { JerseyControlsHandle } from "./Jersey3D";
import { VectorComponents } from "./vectorLibrary";
import { X, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { VectorId } from "./vectorLibrary";

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
    const controlsRef = useRef<JerseyControlsHandle>(null);
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
        className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden select-none border border-border/40 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, #ffffff 0%, #eef0f3 55%, #d8dde3 100%)",
        }}
      >
        {/* 3D canvas */}
        <div className="absolute inset-0">
          <Jersey3D ref={controlsRef} type={type} colors={colors} view={view} />
        </div>

        {/* Floating zoom / reset toolbar (bottom-left) */}
        <div className="absolute left-4 bottom-4 flex flex-col gap-2 z-10">
          <ToolbarBtn label="Zoom in" onClick={() => controlsRef.current?.zoomIn()}>
            <ZoomIn className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Zoom out" onClick={() => controlsRef.current?.zoomOut()}>
            <ZoomOut className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Reset view" onClick={() => controlsRef.current?.reset()}>
            <RefreshCw className="h-4 w-4" />
          </ToolbarBtn>
        </div>

        {/* Vector overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ pointerEvents: dragging ? "auto" : "none" }}
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
                className="absolute cursor-move touch-none pointer-events-auto"
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
                    className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md pointer-events-auto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
JerseyCanvas.displayName = "JerseyCanvas";

function ToolbarBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="h-10 w-10 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-900 shadow-md border border-black/5 flex items-center justify-center transition-all hover:scale-105 backdrop-blur"
    >
      {children}
    </button>
  );
}

export default JerseyCanvas;
