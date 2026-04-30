import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  JerseyType,
  JerseyView,
  ZoneColors,
  JERSEY_TYPE_LABELS,
} from "@/components/customize/jerseyTemplates";
import JerseyCanvas, { PlacedVector } from "@/components/customize/JerseyCanvas";
import ColorPalette from "@/components/customize/ColorPalette";
import { VECTOR_LIST, VectorComponents } from "@/components/customize/vectorLibrary";

type ZoneKey = keyof ZoneColors;

const ZONE_LABELS: Record<ZoneKey, string> = {
  body: "Body",
  sleeves: "Sleeves",
  collar: "Collar",
  sidePanel: "Side Panel",
};

const DEFAULT_COLORS: ZoneColors = {
  body: "#FFFFFF",
  sleeves: "#FFFFFF",
  collar: "#FFFFFF",
  sidePanel: "#FFFFFF",
};

const Customize = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [jerseyType, setJerseyType] = useState<JerseyType>("standard");
  const [view, setView] = useState<JerseyView>("front");
  const [colors, setColors] = useState<ZoneColors>(DEFAULT_COLORS);
  const [selectedZone, setSelectedZone] = useState<ZoneKey>("body");
  const [vectors, setVectors] = useState<PlacedVector[]>([]);
  const [selectedVectorId, setSelectedVectorId] = useState<string | null>(null);
  const [vectorColor, setVectorColor] = useState<string>("#000000");

  const selectedVector = vectors.find((v) => v.id === selectedVectorId) || null;

  const pickColor = (hex: string) => {
    if (selectedVector) {
      setVectors((prev) => prev.map((v) => (v.id === selectedVector.id ? { ...v, color: hex } : v)));
      setVectorColor(hex);
    } else {
      setColors((prev) => ({ ...prev, [selectedZone]: hex }));
    }
  };

  const addVector = (vectorId: PlacedVector["vectorId"]) => {
    const newV: PlacedVector = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      vectorId,
      x: 50,
      y: 50,
      scale: 1,
      color: vectorColor,
    };
    setVectors((prev) => [...prev, newV]);
    setSelectedVectorId(newV.id);
  };

  const reset = () => {
    setColors(DEFAULT_COLORS);
    setVectors([]);
    setSelectedVectorId(null);
  };

  const updateScale = (scale: number) => {
    if (!selectedVectorId) return;
    setVectors((prev) => prev.map((v) => (v.id === selectedVectorId ? { ...v, scale } : v)));
  };

  const sendToEnquiry = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, { cacheBust: true, pixelRatio: 2 });
      const colorSummary = Object.entries(colors)
        .map(([k, v]) => `${ZONE_LABELS[k as ZoneKey]}: ${v}`)
        .join(", ");
      const vectorSummary = vectors.length
        ? vectors.map((v) => `${v.vectorId}(${v.color})`).join(", ")
        : "none";
      const summary =
        `Custom Design — ${JERSEY_TYPE_LABELS[jerseyType]}\n` +
        `Colors: ${colorSummary}\n` +
        `Graphics: ${vectorSummary}`;

      navigate("/enquiry", {
        state: {
          customDesign: {
            jerseyType,
            jerseyTypeLabel: JERSEY_TYPE_LABELS[jerseyType],
            summary,
            previewDataUrl: dataUrl,
          },
        },
      });
    } catch (err) {
      toast.error("Could not export your design. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-12 text-center space-y-3 animate-slide-up">
        <p className="font-display text-accent uppercase tracking-[0.3em] text-sm inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Design Studio
        </p>
        <h1 className="text-4xl md:text-6xl font-display text-gradient title-glow inline-block">
          Custom Your Design
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Pick a jersey, paint each zone, and stamp graphics. When you're done, we'll send it straight to our team.
        </p>
      </section>

      <section className="container max-w-7xl pb-20">
        <div className="grid lg:grid-cols-[260px_1fr_300px] gap-6">
          {/* LEFT — jersey type + vectors */}
          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <h2 className="font-display uppercase tracking-[0.2em] text-xs text-accent">Jersey Type</h2>
              <div className="space-y-2">
                {(Object.keys(JERSEY_TYPE_LABELS) as JerseyType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setJerseyType(t)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md font-display text-sm transition-all border",
                      jerseyType === t
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-accent/40"
                    )}
                  >
                    {JERSEY_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <h2 className="font-display uppercase tracking-[0.2em] text-xs text-accent">Graphics</h2>
              <p className="text-xs text-muted-foreground">Tap to add — drag to position.</p>
              <div className="grid grid-cols-3 gap-2">
                {VECTOR_LIST.map(({ id, label }) => {
                  const V = VectorComponents[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => addVector(id)}
                      title={label}
                      className="aspect-square bg-background border border-border rounded-md p-1.5 hover:border-accent hover:scale-105 transition-all flex items-center justify-center"
                    >
                      <V color="hsl(var(--foreground))" size={40} />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* CENTER — preview */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {(["front", "back"] as JerseyView[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "px-4 py-1.5 rounded-full font-display uppercase text-xs tracking-wider transition-all border",
                    view === v
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>

            <JerseyCanvas
              ref={canvasRef}
              type={jerseyType}
              view={view}
              colors={colors}
              vectors={vectors}
              selectedVectorId={selectedVectorId}
              onSelectVector={setSelectedVectorId}
              onMoveVector={(id, x, y) =>
                setVectors((prev) => prev.map((v) => (v.id === id ? { ...v, x, y } : v)))
              }
              onRemoveVector={(id) => {
                setVectors((prev) => prev.filter((v) => v.id !== id));
                setSelectedVectorId(null);
              }}
            />

            {selectedVector && (
              <div className="w-full max-w-md bg-card border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                    Selected: {selectedVector.vectorId}
                  </span>
                  <span className="text-xs text-muted-foreground">Size</span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={2.5}
                  step={0.1}
                  value={selectedVector.scale}
                  onChange={(e) => updateScale(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <div className="flex gap-3 w-full max-w-md">
              <Button variant="outline" onClick={reset} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
              <Button variant="hero" onClick={sendToEnquiry} className="flex-1">
                <Send className="h-4 w-4 mr-2" /> Send to Enquiry
              </Button>
            </div>
          </div>

          {/* RIGHT — colors */}
          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <div>
                <h2 className="font-display uppercase tracking-[0.2em] text-xs text-accent mb-2">
                  {selectedVector ? "Graphic Color" : "Zone"}
                </h2>
                {!selectedVector && (
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(ZONE_LABELS) as ZoneKey[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setSelectedZone(k)}
                        className={cn(
                          "px-2 py-2 rounded-md font-display text-xs uppercase tracking-wider border transition-all flex items-center gap-2",
                          selectedZone === k
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span
                          className="w-4 h-4 rounded border border-border"
                          style={{ backgroundColor: colors[k] }}
                        />
                        {ZONE_LABELS[k]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-display uppercase tracking-[0.2em] text-xs text-accent mb-2">
                  Color Palette
                </h2>
                <ColorPalette
                  selectedColor={selectedVector ? selectedVector.color : colors[selectedZone]}
                  onPick={pickColor}
                />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Customize;
