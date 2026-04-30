import React from "react";

export type ZoneColors = {
  body: string;
  sleeves: string;
  collar: string;
  sidePanel: string;
};

export type JerseyType = "standard" | "long-sleeve" | "singlet" | "collared";
export type JerseyView = "front" | "back";

interface TemplateProps {
  colors: ZoneColors;
  view: JerseyView;
}

const STROKE = "hsl(var(--foreground))";
const STROKE_W = 1.5;

/* Standard cutting — short sleeve crew neck */
const Standard = ({ colors, view }: TemplateProps) => (
  <svg viewBox="0 0 400 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Sleeves */}
    <path d="M70 110 L20 220 L70 250 L120 200 Z" fill={colors.sleeves} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M330 110 L380 220 L330 250 L280 200 Z" fill={colors.sleeves} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    {/* Body */}
    <path d="M120 200 L120 470 Q120 480 130 480 L270 480 Q280 480 280 470 L280 200 Z" fill={colors.body} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    {/* Side panels */}
    <path d="M120 200 L120 470 Q120 480 130 480 L150 480 L150 200 Z" fill={colors.sidePanel} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M280 200 L280 470 Q280 480 270 480 L250 480 L250 200 Z" fill={colors.sidePanel} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    {/* Shoulder line */}
    <path d="M120 200 Q200 180 280 200" fill={colors.body} stroke={STROKE} strokeWidth={STROKE_W} />
    {/* Collar */}
    {view === "front" ? (
      <path d="M165 195 Q200 225 235 195 L230 180 Q200 195 170 180 Z" fill={colors.collar} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    ) : (
      <path d="M165 195 Q200 205 235 195 L230 180 Q200 188 170 180 Z" fill={colors.collar} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    )}
  </svg>
);

/* Long sleeve */
const LongSleeve = ({ colors, view }: TemplateProps) => (
  <svg viewBox="0 0 400 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <path d="M70 110 L10 380 L60 395 L120 200 Z" fill={colors.sleeves} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M330 110 L390 380 L340 395 L280 200 Z" fill={colors.sleeves} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M120 200 L120 470 Q120 480 130 480 L270 480 Q280 480 280 470 L280 200 Z" fill={colors.body} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M120 200 L120 470 Q120 480 130 480 L150 480 L150 200 Z" fill={colors.sidePanel} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M280 200 L280 470 Q280 480 270 480 L250 480 L250 200 Z" fill={colors.sidePanel} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M120 200 Q200 180 280 200" fill={colors.body} stroke={STROKE} strokeWidth={STROKE_W} />
    {view === "front" ? (
      <path d="M165 195 Q200 225 235 195 L230 180 Q200 195 170 180 Z" fill={colors.collar} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    ) : (
      <path d="M165 195 Q200 205 235 195 L230 180 Q200 188 170 180 Z" fill={colors.collar} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    )}
  </svg>
);

/* Singlet — sleeveless */
const Singlet = ({ colors, view }: TemplateProps) => (
  <svg viewBox="0 0 400 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <path d="M130 180 L100 250 L140 260 L150 210 Z" fill={colors.sleeves} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M270 180 L300 250 L260 260 L250 210 Z" fill={colors.sleeves} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M150 210 L130 470 Q130 480 140 480 L260 480 Q270 480 270 470 L250 210 Z" fill={colors.body} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M150 210 L130 470 Q130 480 140 480 L155 480 L160 210 Z" fill={colors.sidePanel} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M250 210 L270 470 Q270 480 260 480 L245 480 L240 210 Z" fill={colors.sidePanel} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    {view === "front" ? (
      <path d="M170 195 Q200 245 230 195 Q200 210 170 195 Z" fill={colors.collar} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    ) : (
      <path d="M170 195 Q200 210 230 195 Q200 200 170 195 Z" fill={colors.collar} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    )}
  </svg>
);

/* Collared — polo style */
const Collared = ({ colors, view }: TemplateProps) => (
  <svg viewBox="0 0 400 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <path d="M70 110 L20 220 L70 250 L120 200 Z" fill={colors.sleeves} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M330 110 L380 220 L330 250 L280 200 Z" fill={colors.sleeves} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M120 200 L120 470 Q120 480 130 480 L270 480 Q280 480 280 470 L280 200 Z" fill={colors.body} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M120 200 L120 470 Q120 480 130 480 L150 480 L150 200 Z" fill={colors.sidePanel} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M280 200 L280 470 Q280 480 270 480 L250 480 L250 200 Z" fill={colors.sidePanel} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    <path d="M120 200 Q200 180 280 200" fill={colors.body} stroke={STROKE} strokeWidth={STROKE_W} />
    {/* Polo collar */}
    <path d="M155 180 L200 230 L245 180 L255 200 L200 250 L145 200 Z" fill={colors.collar} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin="round" />
    {view === "front" && (
      <>
        <line x1="200" y1="230" x2="200" y2="290" stroke={STROKE} strokeWidth={STROKE_W} />
        <circle cx="200" cy="250" r="2.5" fill={STROKE} />
        <circle cx="200" cy="275" r="2.5" fill={STROKE} />
      </>
    )}
  </svg>
);

export const JerseyTemplate = ({ type, colors, view }: { type: JerseyType; colors: ZoneColors; view: JerseyView }) => {
  switch (type) {
    case "long-sleeve":
      return <LongSleeve colors={colors} view={view} />;
    case "singlet":
      return <Singlet colors={colors} view={view} />;
    case "collared":
      return <Collared colors={colors} view={view} />;
    default:
      return <Standard colors={colors} view={view} />;
  }
};

export const JERSEY_TYPE_LABELS: Record<JerseyType, string> = {
  standard: "Standard Cutting",
  "long-sleeve": "Long Sleeve",
  singlet: "Singlet",
  collared: "Collared",
};
