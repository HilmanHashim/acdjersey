import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Send, RotateCcw, Shirt, Palette, Sparkles, ClipboardCheck } from "lucide-react";
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
  const [tab, setTab] = useState<"design" | "colors" | "graphics" | "review">("design");

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Slim header bar */}
      <div className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="container max-w-[1500px] py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-gradient leading-none">
              Customize Your Design
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Pick a jersey, paint each zone, stamp graphics — then send it to our team.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-background/60 border border-border rounded-full p-1">
            {(["front", "back"] as JerseyView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "px-4 py-1.5 rounded-full font-display uppercase text-xs tracking-wider transition-all",
                  view === v
                    ? "bg-accent text-accent-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <section className="flex-1">
        <div className="container max-w-[1500px] py-6">
          <div className="grid lg:grid-cols-[1fr_400px] gap-6 h-[calc(100vh-220px)] min-h-[600px]">
            {/* LEFT — 3D stage */}
            <div className="relative">
              <JerseyCanvas
                ref={canvasRef}
                type={jerseyType}
                view={view}
                onViewChange={setView}
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
            </div>

            {/* RIGHT — control panel */}
            <aside className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
              <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as typeof tab)}
                className="flex-1 flex flex-col"
              >
                <TabsList className="grid grid-cols-4 w-full rounded-none bg-card border-b border-border h-auto p-0">
                  <TabTrigger value="design" icon={<Shirt className="h-4 w-4" />} label="Design" />
                  <TabTrigger value="colors" icon={<Palette className="h-4 w-4" />} label="Colors" />
                  <TabTrigger value="graphics" icon={<Sparkles className="h-4 w-4" />} label="Graphics" />
                  <TabTrigger value="review" icon={<ClipboardCheck className="h-4 w-4" />} label="Review" />
                </TabsList>

                <div className="flex-1 overflow-y-auto p-5">
                  {/* DESIGN */}
                  <TabsContent value="design" className="m-0 space-y-3">
                    <SectionHeader title="Jersey Type" />
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(JERSEY_TYPE_LABELS) as JerseyType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setJerseyType(t)}
                          className={cn(
                            "group w-full text-left px-4 py-3 rounded-xl font-display text-sm transition-all border flex items-center justify-between",
                            jerseyType === t
                              ? "border-accent bg-accent/10 text-foreground shadow-[0_0_18px_-6px_hsl(var(--accent)/0.7)]"
                              : "border-border text-muted-foreground hover:text-foreground hover:border-accent/40 hover:bg-accent/5"
                          )}
                        >
                          <span>{JERSEY_TYPE_LABELS[t]}</span>
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full transition-all",
                              jerseyType === t
                                ? "bg-accent shadow-[0_0_8px_hsl(var(--accent))]"
                                : "bg-border group-hover:bg-accent/50"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  {/* COLORS */}
                  <TabsContent value="colors" className="m-0 space-y-5">
                    <div>
                      <SectionHeader title={selectedVector ? "Graphic" : "Paint Zone"} />
                      {!selectedVector ? (
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.keys(ZONE_LABELS) as ZoneKey[]).map((k) => {
                            const active = selectedZone === k;
                            return (
                              <button
                                key={k}
                                type="button"
                                onClick={() => setSelectedZone(k)}
                                className={cn(
                                  "px-3 py-2.5 rounded-lg font-display text-[11px] uppercase tracking-wider border transition-all flex items-center gap-2",
                                  active
                                    ? "border-accent bg-accent/10 text-foreground shadow-[0_0_14px_-4px_hsl(var(--accent)/0.6)]"
                                    : "border-border text-muted-foreground hover:text-foreground hover:border-accent/40"
                                )}
                              >
                                <span
                                  className="w-5 h-5 rounded-md border border-foreground/20 shadow-inner shrink-0"
                                  style={{ background: colors[k] }}
                                />
                                <span className="truncate">{ZONE_LABELS[k]}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-accent/40 bg-accent/5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-6 h-6 rounded-md border border-foreground/20"
                              style={{ background: selectedVector.color }}
                            />
                            <span className="font-display text-xs uppercase tracking-wider">
                              {selectedVector.vectorId}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedVectorId(null)}
                            className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                          >
                            Deselect
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <SectionHeader title="Color Palette" />
                      <ColorPalette
                        selectedColor={selectedVector ? selectedVector.color : colors[selectedZone]}
                        onPick={pickColor}
                      />
                    </div>
                  </TabsContent>

                  {/* GRAPHICS */}
                  <TabsContent value="graphics" className="m-0 space-y-4">
                    <SectionHeader title="Add Graphic" />
                    <p className="text-xs text-muted-foreground -mt-2">Tap to add — drag to position.</p>
                    <div className="grid grid-cols-4 gap-2">
                      {VECTOR_LIST.map(({ id, label }) => {
                        const V = VectorComponents[id];
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => addVector(id)}
                            title={label}
                            className="aspect-square bg-background/60 border border-border rounded-lg p-2 hover:border-accent hover:bg-accent/10 hover:scale-105 transition-all flex items-center justify-center"
                          >
                            <V color="hsl(var(--foreground))" size={36} />
                          </button>
                        );
                      })}
                    </div>

                    {selectedVector && (
                      <div className="bg-background/60 border border-border rounded-xl p-3 space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                            Selected: {selectedVector.vectorId}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Size {selectedVector.scale.toFixed(1)}×
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.3}
                          max={2.5}
                          step={0.1}
                          value={selectedVector.scale}
                          onChange={(e) => updateScale(Number(e.target.value))}
                          className="w-full accent-[hsl(var(--accent))]"
                        />
                      </div>
                    )}
                  </TabsContent>

                  {/* REVIEW */}
                  <TabsContent value="review" className="m-0 space-y-4">
                    <SectionHeader title="Summary" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-border/60 pb-2">
                        <span className="text-muted-foreground">Jersey type</span>
                        <span className="font-display">{JERSEY_TYPE_LABELS[jerseyType]}</span>
                      </div>
                      {(Object.keys(ZONE_LABELS) as ZoneKey[]).map((k) => (
                        <div key={k} className="flex justify-between items-center border-b border-border/60 pb-2">
                          <span className="text-muted-foreground">{ZONE_LABELS[k]}</span>
                          <span className="flex items-center gap-2 font-mono text-xs">
                            <span
                              className="w-4 h-4 rounded border border-foreground/20"
                              style={{ background: colors[k] }}
                            />
                            {colors[k].toUpperCase()}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Graphics</span>
                        <span className="font-display">{vectors.length}</span>
                      </div>
                    </div>
                  </TabsContent>
                </div>

                {/* Sticky footer */}
                <div className="border-t border-border p-3 bg-card flex gap-2">
                  <Button variant="outline" onClick={reset} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                  <Button variant="hero" onClick={sendToEnquiry} className="flex-[2]">
                    <Send className="h-4 w-4 mr-2" /> Send to Enquiry
                  </Button>
                </div>
              </Tabs>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-accent to-primary" />
    <h2 className="font-display uppercase tracking-[0.2em] text-xs text-foreground">{title}</h2>
  </div>
);

const TabTrigger = ({
  value,
  icon,
  label,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <TabsTrigger
    value={value}
    className={cn(
      "rounded-none h-12 flex flex-col items-center justify-center gap-0.5 text-[10px] uppercase tracking-wider font-display border-b-2 border-transparent",
      "data-[state=active]:border-accent data-[state=active]:bg-accent/5 data-[state=active]:text-foreground data-[state=active]:shadow-none",
      "text-muted-foreground hover:text-foreground transition-colors"
    )}
  >
    {icon}
    <span>{label}</span>
  </TabsTrigger>
);

export default Customize;
