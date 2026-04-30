import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  (same as before — JerseyCanvas.tsx needs no changes)
// ─────────────────────────────────────────────────────────────────────────────
export type ZoneColors = {
  body: string;
  sleeves: string;
  collar: string;
  sidePanel: string;
};

export type JerseyType = "standard" | "long-sleeve" | "singlet" | "collared" | "muslimah" | "sleeveless";
export type JerseyView = "front" | "back";

interface TemplateProps {
  colors: ZoneColors;
  view: JerseyView;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns inline-style CSS for a realistic fabric gradient on a colour.
 * Uses 3 layered stops: left-edge shadow → highlight ridge → right-edge shadow.
 */
function bodyGrad(hex: string): React.CSSProperties {
  return {
    background: `
      linear-gradient(
        to right,
        color-mix(in srgb, ${hex} 68%, #000 32%) 0%,
        color-mix(in srgb, ${hex} 88%, #000 12%) 8%,
        color-mix(in srgb, ${hex} 100%, transparent) 30%,
        ${hex} 45%,
        color-mix(in srgb, ${hex} 97%, #fff 3%) 55%,
        color-mix(in srgb, ${hex} 100%, transparent) 70%,
        color-mix(in srgb, ${hex} 88%, #000 12%) 92%,
        color-mix(in srgb, ${hex} 68%, #000 32%) 100%
      )
    `,
  };
}

/** Top-left specular shine layer — simulates light source */
const ShineLayer = () => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      inset: 0,
      background: `
        radial-gradient(
          ellipse 55% 45% at 32% 18%,
          rgba(255,255,255,0.28) 0%,
          rgba(255,255,255,0.10) 35%,
          transparent 70%
        )
      `,
      pointerEvents: "none",
      zIndex: 4,
    }}
  />
);

/** Thin vertical specular highlight stripe — the main 3-D trick */
const SpecularStripe = ({ left = "40%" }: { left?: string }) => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      left,
      width: "3px",
      background: "linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 40%, transparent 100%)",
      pointerEvents: "none",
      zIndex: 5,
    }}
  />
);

/** Bottom-hem fade */
const HemFade = () => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "12%",
      background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.12))",
      pointerEvents: "none",
      zIndex: 4,
    }}
  />
);

/** Fabric micro-texture overlay */
const FabricTexture = () => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='1' cy='1' r='.55' fill='rgba(0,0,0,0.045)'/%3E%3C/svg%3E")`,
      backgroundSize: "4px 4px",
      pointerEvents: "none",
      zIndex: 3,
      borderRadius: "inherit",
    }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD — short sleeve crew neck
// ─────────────────────────────────────────────────────────────────────────────
const Standard = ({ colors, view }: TemplateProps) => {
  const bodyStyle = bodyGrad(colors.body);
  const sleeveStyle = bodyGrad(colors.sleeves);
  const sideStyle: React.CSSProperties = { background: colors.sidePanel };
  const collarStyle: React.CSSProperties = { background: colors.collar };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", userSelect: "none" }}>
      <svg
        viewBox="0 0 400 500"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Body clip */}
          <clipPath id="ss-body-clip">
            <path d="M120 160 Q200 140 280 160 L290 480 Q290 492 278 492 L122 492 Q110 492 110 480 Z" />
          </clipPath>
          {/* Left sleeve clip */}
          <clipPath id="ss-sleeveL-clip">
            <path d="M62 100 L8 228 Q2 244 14 250 L72 256 Q86 252 90 238 L118 168 Z" />
          </clipPath>
          {/* Right sleeve clip */}
          <clipPath id="ss-sleeveR-clip">
            <path d="M338 100 L392 228 Q398 244 386 250 L328 256 Q314 252 310 238 L282 168 Z" />
          </clipPath>
          {/* Left side panel clip */}
          <clipPath id="ss-sideL-clip">
            <path d="M110 175 L110 492 L140 492 L136 175 Z" />
          </clipPath>
          {/* Right side panel clip */}
          <clipPath id="ss-sideR-clip">
            <path d="M290 175 L290 492 L260 492 L264 175 Z" />
          </clipPath>
          {/* Collar clip front */}
          <clipPath id="ss-collar-front-clip">
            <path d="M158 155 Q200 198 242 155 L236 138 Q200 165 164 138 Z" />
          </clipPath>
          {/* Collar clip back */}
          <clipPath id="ss-collar-back-clip">
            <path d="M158 155 Q200 168 242 155 L236 138 Q200 152 164 138 Z" />
          </clipPath>

          {/* Sleeve left gradient */}
          <linearGradient id="ss-slL-grad" x1="1" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
          </linearGradient>
          <linearGradient id="ss-slR-grad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
          </linearGradient>
          {/* Collar shade */}
          <linearGradient id="ss-collar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
          </linearGradient>

          {/* Body radial shine */}
          <radialGradient id="ss-body-shine" cx="35%" cy="22%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.26)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
          </radialGradient>
          {/* Side-edge darkening */}
          <linearGradient id="ss-body-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0.20)" />
            <stop offset="12%" stopColor="rgba(0,0,0,0)" />
            <stop offset="88%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
          </linearGradient>
          {/* Bottom fade */}
          <linearGradient id="ss-body-bottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="72%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
          </linearGradient>
          {/* Sleeve hem grad */}
          <linearGradient id="ss-hem-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
          </linearGradient>
        </defs>

        {/* ── LEFT SLEEVE ── */}
        <path d="M62 100 L8 228 Q2 244 14 250 L72 256 Q86 252 90 238 L118 168 Z" fill={colors.sleeves} />
        {/* sleeve side-panel tint */}
        <path d="M104 160 L86 234 L72 256 Q86 252 90 238 L118 168 Z" fill={colors.sidePanel} opacity={0.5} />
        {/* sleeve shading */}
        <path d="M62 100 L8 228 Q2 244 14 250 L72 256 Q86 252 90 238 L118 168 Z" fill="url(#ss-slL-grad)" />
        {/* sleeve hem band */}
        <path
          d="M8 228 Q2 244 14 250 L72 256 Q86 252 90 238 L82 234 Q72 246 56 248 L16 242 Q8 236 12 224 Z"
          fill={colors.collar}
          opacity={0.9}
        />
        <path
          d="M8 228 Q2 244 14 250 L72 256 Q86 252 90 238 L82 234 Q72 246 56 248 L16 242 Q8 236 12 224 Z"
          fill="url(#ss-hem-grad)"
        />
        {/* sleeve highlight crease */}
        <path
          d="M76 120 Q60 175 52 228"
          fill="none"
          stroke="rgba(255,255,255,0.13)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* ── RIGHT SLEEVE ── */}
        <path d="M338 100 L392 228 Q398 244 386 250 L328 256 Q314 252 310 238 L282 168 Z" fill={colors.sleeves} />
        <path d="M296 160 L314 234 L328 256 Q314 252 310 238 L282 168 Z" fill={colors.sidePanel} opacity={0.5} />
        <path d="M338 100 L392 228 Q398 244 386 250 L328 256 Q314 252 310 238 L282 168 Z" fill="url(#ss-slR-grad)" />
        <path
          d="M392 228 Q398 244 386 250 L328 256 Q314 252 310 238 L318 234 Q328 246 344 248 L384 242 Q392 236 388 224 Z"
          fill={colors.collar}
          opacity={0.9}
        />
        <path
          d="M392 228 Q398 244 386 250 L328 256 Q314 252 310 238 L318 234 Q328 246 344 248 L384 242 Q392 236 388 224 Z"
          fill="url(#ss-hem-grad)"
        />
        <path
          d="M324 120 Q340 175 348 228"
          fill="none"
          stroke="rgba(255,255,255,0.13)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* ── BODY base ── */}
        <path d="M120 160 Q200 140 280 160 L290 480 Q290 492 278 492 L122 492 Q110 492 110 480 Z" fill={colors.body} />

        {/* ── SIDE PANELS ── */}
        <path d="M110 175 L110 492 L140 492 L136 175 Z" fill={colors.sidePanel} opacity={0.85} />
        <path d="M290 175 L290 492 L260 492 L264 175 Z" fill={colors.sidePanel} opacity={0.85} />

        {/* ── BODY shading layers ── */}
        <path
          d="M120 160 Q200 140 280 160 L290 480 Q290 492 278 492 L122 492 Q110 492 110 480 Z"
          fill="url(#ss-body-shine)"
        />
        <path
          d="M120 160 Q200 140 280 160 L290 480 Q290 492 278 492 L122 492 Q110 492 110 480 Z"
          fill="url(#ss-body-side)"
        />
        <path
          d="M120 160 Q200 140 280 160 L290 480 Q290 492 278 492 L122 492 Q110 492 110 480 Z"
          fill="url(#ss-body-bottom)"
        />

        {/* ── BOTTOM HEM BAND ── */}
        <path
          d="M111 476 Q200 494 289 476 L289 490 Q290 492 278 492 L122 492 Q110 492 110 490 Z"
          fill={colors.collar}
          opacity={0.55}
        />

        {/* ── SHOULDER SEAMS ── */}
        <path d="M118 168 L158 155" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
        <path d="M282 168 L242 155" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />

        {/* ── ARMHOLE SEAMS ── */}
        <path d="M118 168 Q115 162 120 160" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        <path d="M282 168 Q285 162 280 160" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />

        {/* ── SIDE SEAM stitching ── */}
        <path d="M112 178 L110 480" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />
        <path d="M288 178 L290 480" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />

        {/* ── COLLAR ── */}
        {view === "front" ? (
          <>
            <path d="M158 155 Q200 198 242 155 L236 138 Q200 165 164 138 Z" fill={colors.collar} />
            <path d="M158 155 Q200 198 242 155 L236 138 Q200 165 164 138 Z" fill="url(#ss-collar-grad)" />
            {/* collar inner shadow */}
            <path d="M164 138 Q200 162 236 138 L232 144 Q200 166 168 144 Z" fill="rgba(0,0,0,0.10)" />
            {/* rib lines */}
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M ${166 + i * 18} 150 Q 200 ${160 + i * 3} ${234 - i * 18} 150`}
                fill="none"
                stroke="rgba(0,0,0,0.07)"
                strokeWidth="0.7"
              />
            ))}
          </>
        ) : (
          <>
            <path d="M158 155 Q200 168 242 155 L236 138 Q200 152 164 138 Z" fill={colors.collar} />
            <path d="M158 155 Q200 168 242 155 L236 138 Q200 152 164 138 Z" fill="url(#ss-collar-grad)" />
          </>
        )}

        {/* ── SPECULAR HIGHLIGHT (the key 3-D trick) ── */}
        <path
          d="M172 148 Q170 300 174 488"
          fill="none"
          stroke="rgba(255,255,255,0.13)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M176 148 Q174 300 178 488"
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Center seam */}
        <path d="M200 165 L200 490" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LONG SLEEVE
// ─────────────────────────────────────────────────────────────────────────────
const LongSleeve = ({ colors, view }: TemplateProps) => (
  <div style={{ position: "relative", width: "100%", height: "100%", userSelect: "none" }}>
    <svg
      viewBox="0 0 400 500"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ls-slL" x1="1" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.24)" />
        </linearGradient>
        <linearGradient id="ls-slR" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.24)" />
        </linearGradient>
        <radialGradient id="ls-body-shine" cx="35%" cy="22%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.26)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </radialGradient>
        <linearGradient id="ls-body-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.20)" />
          <stop offset="12%" stopColor="rgba(0,0,0,0)" />
          <stop offset="88%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>
        <linearGradient id="ls-body-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="72%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
        </linearGradient>
        <linearGradient id="ls-collar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>
        <linearGradient id="ls-hem-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>

      {/* ── LEFT LONG SLEEVE ── */}
      <path d="M62 100 L4 360 Q-2 378 12 384 L68 376 Q82 371 86 356 L118 168 Z" fill={colors.sleeves} />
      <path d="M105 158 L78 348 L68 376 Q82 371 86 356 L118 168 Z" fill={colors.sidePanel} opacity={0.5} />
      <path d="M62 100 L4 360 Q-2 378 12 384 L68 376 Q82 371 86 356 L118 168 Z" fill="url(#ls-slL)" />
      {/* cuff band */}
      <path
        d="M4 360 Q-2 378 12 384 L68 376 Q82 371 86 356 L78 352 Q68 366 50 369 L14 373 Q4 367 8 353 Z"
        fill={colors.collar}
        opacity={0.9}
      />
      <path
        d="M4 360 Q-2 378 12 384 L68 376 Q82 371 86 356 L78 352 Q68 366 50 369 L14 373 Q4 367 8 353 Z"
        fill="url(#ls-hem-grad)"
      />
      {/* elbow fold */}
      <path
        d="M86 220 Q72 268 66 318"
        fill="none"
        stroke="rgba(255,255,255,0.11)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* sleeve highlight */}
      <path d="M78 115 Q62 225 54 348" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />

      {/* ── RIGHT LONG SLEEVE ── */}
      <path d="M338 100 L396 360 Q402 378 388 384 L332 376 Q318 371 314 356 L282 168 Z" fill={colors.sleeves} />
      <path d="M295 158 L322 348 L332 376 Q318 371 314 356 L282 168 Z" fill={colors.sidePanel} opacity={0.5} />
      <path d="M338 100 L396 360 Q402 378 388 384 L332 376 Q318 371 314 356 L282 168 Z" fill="url(#ls-slR)" />
      <path
        d="M396 360 Q402 378 388 384 L332 376 Q318 371 314 356 L322 352 Q332 366 350 369 L386 373 Q396 367 392 353 Z"
        fill={colors.collar}
        opacity={0.9}
      />
      <path
        d="M396 360 Q402 378 388 384 L332 376 Q318 371 314 356 L322 352 Q332 366 350 369 L386 373 Q396 367 392 353 Z"
        fill="url(#ls-hem-grad)"
      />
      <path
        d="M314 220 Q328 268 334 318"
        fill="none"
        stroke="rgba(255,255,255,0.11)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M322 115 Q338 225 346 348" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />

      {/* ── BODY ── */}
      <path d="M120 160 Q200 140 280 160 L290 480 Q290 492 278 492 L122 492 Q110 492 110 480 Z" fill={colors.body} />
      <path d="M110 175 L110 492 L140 492 L136 175 Z" fill={colors.sidePanel} opacity={0.85} />
      <path d="M290 175 L290 492 L260 492 L264 175 Z" fill={colors.sidePanel} opacity={0.85} />
      <path
        d="M120 160 Q200 140 280 160 L290 480 Q290 492 278 492 L122 492 Q110 492 110 480 Z"
        fill="url(#ls-body-shine)"
      />
      <path
        d="M120 160 Q200 140 280 160 L290 480 Q290 492 278 492 L122 492 Q110 492 110 480 Z"
        fill="url(#ls-body-side)"
      />
      <path
        d="M120 160 Q200 140 280 160 L290 480 Q290 492 278 492 L122 492 Q110 492 110 480 Z"
        fill="url(#ls-body-bottom)"
      />
      <path
        d="M111 476 Q200 494 289 476 L289 490 Q290 492 278 492 L122 492 Q110 492 110 490 Z"
        fill={colors.collar}
        opacity={0.55}
      />

      {/* ── COLLAR ── */}
      {view === "front" ? (
        <>
          <path d="M158 155 Q200 198 242 155 L236 138 Q200 165 164 138 Z" fill={colors.collar} />
          <path d="M158 155 Q200 198 242 155 L236 138 Q200 165 164 138 Z" fill="url(#ls-collar-grad)" />
          <path d="M164 138 Q200 162 236 138 L232 144 Q200 166 168 144 Z" fill="rgba(0,0,0,0.10)" />
        </>
      ) : (
        <>
          <path d="M158 155 Q200 168 242 155 L236 138 Q200 152 164 138 Z" fill={colors.collar} />
          <path d="M158 155 Q200 168 242 155 L236 138 Q200 152 164 138 Z" fill="url(#ls-collar-grad)" />
        </>
      )}

      {/* Seams */}
      <path d="M118 168 L158 155" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      <path d="M282 168 L242 155" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      <path d="M112 178 L110 480" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />
      <path d="M288 178 L290 480" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />

      {/* Specular */}
      <path
        d="M172 148 Q170 310 174 488"
        fill="none"
        stroke="rgba(255,255,255,0.13)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M176 148 Q174 310 178 488"
        fill="none"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SINGLET
// ─────────────────────────────────────────────────────────────────────────────
const Singlet = ({ colors, view }: TemplateProps) => (
  <div style={{ position: "relative", width: "100%", height: "100%", userSelect: "none" }}>
    <svg
      viewBox="0 0 400 500"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sg-body-shine" cx="35%" cy="22%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.26)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </radialGradient>
        <linearGradient id="sg-body-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.22)" />
          <stop offset="16%" stopColor="rgba(0,0,0,0)" />
          <stop offset="84%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
        </linearGradient>
        <linearGradient id="sg-body-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="72%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
        </linearGradient>
        <linearGradient id="sg-armholeL" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="sg-armholeR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="sg-collar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>
      </defs>

      {/* Body with armhole cutouts — singlet silhouette */}
      <path
        d={`M 182 52 L 155 48 Q 136 50 126 66 L 118 94
           Q 96 105 74 136 L 68 172 Q 80 188 102 193 L 126 189
           L 122 472 Q 122 484 134 484 L 266 484 Q 278 484 278 472
           L 274 189 L 298 193 Q 320 188 332 172 L 326 136
           Q 304 105 282 94 L 274 66 Q 264 50 245 48 L 218 52
           Q 208 42 200 40 Q 192 42 182 52 Z`}
        fill={colors.body}
      />

      {/* Side panels */}
      <path d="M 122 200 L 122 484 L 148 484 L 144 198 Z" fill={colors.sidePanel} opacity={0.85} />
      <path d="M 278 200 L 278 484 L 252 484 L 256 198 Z" fill={colors.sidePanel} opacity={0.85} />

      {/* Shading */}
      <path
        d={`M 182 52 L 155 48 Q 136 50 126 66 L 118 94 Q 96 105 74 136 L 68 172 Q 80 188 102 193 L 126 189 L 122 472 Q 122 484 134 484 L 266 484 Q 278 484 278 472 L 274 189 L 298 193 Q 320 188 332 172 L 326 136 Q 304 105 282 94 L 274 66 Q 264 50 245 48 L 218 52 Q 208 42 200 40 Q 192 42 182 52 Z`}
        fill="url(#sg-body-shine)"
      />
      <path
        d={`M 182 52 L 155 48 Q 136 50 126 66 L 118 94 Q 96 105 74 136 L 68 172 Q 80 188 102 193 L 126 189 L 122 472 Q 122 484 134 484 L 266 484 Q 278 484 278 472 L 274 189 L 298 193 Q 320 188 332 172 L 326 136 Q 304 105 282 94 L 274 66 Q 264 50 245 48 L 218 52 Q 208 42 200 40 Q 192 42 182 52 Z`}
        fill="url(#sg-body-side)"
      />
      <path
        d={`M 182 52 L 155 48 Q 136 50 126 66 L 118 94 Q 96 105 74 136 L 68 172 Q 80 188 102 193 L 126 189 L 122 472 Q 122 484 134 484 L 266 484 Q 278 484 278 472 L 274 189 L 298 193 Q 320 188 332 172 L 326 136 Q 304 105 282 94 L 274 66 Q 264 50 245 48 L 218 52 Q 208 42 200 40 Q 192 42 182 52 Z`}
        fill="url(#sg-body-bottom)"
      />

      {/* Armhole inner shadows */}
      <path
        d="M 74 136 Q 84 162 102 180 L 126 189 L 126 202 Q 100 196 80 172 Q 64 150 68 130 Z"
        fill="url(#sg-armholeL)"
      />
      <path
        d="M 326 136 Q 316 162 298 180 L 274 189 L 274 202 Q 300 196 320 172 Q 336 150 332 130 Z"
        fill="url(#sg-armholeR)"
      />

      {/* Armhole binding */}
      <path
        d="M 126 94 Q 100 106 78 134 L 70 166 Q 80 184 104 190 L 126 186"
        fill="none"
        stroke={colors.collar}
        strokeWidth="7"
        strokeOpacity={0.8}
        strokeLinecap="round"
      />
      <path
        d="M 126 94 Q 100 106 78 134 L 70 166 Q 80 184 104 190 L 126 186"
        fill="none"
        stroke="rgba(0,0,0,0.14)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M 274 94 Q 300 106 322 134 L 330 166 Q 320 184 296 190 L 274 186"
        fill="none"
        stroke={colors.collar}
        strokeWidth="7"
        strokeOpacity={0.8}
        strokeLinecap="round"
      />
      <path
        d="M 274 94 Q 300 106 322 134 L 330 166 Q 320 184 296 190 L 274 186"
        fill="none"
        stroke="rgba(0,0,0,0.14)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      {/* Neck binding */}
      {view === "front" ? (
        <>
          <path
            d="M 182 52 Q 192 36 200 34 Q 208 36 218 52 L 212 64 Q 204 52 200 50 Q 196 52 188 64 Z"
            fill={colors.collar}
          />
          <path d="M 188 64 Q 200 76 212 64 L 208 70 Q 200 80 192 70 Z" fill={colors.collar} />
          <path d="M 182 52 Q 192 36 200 34 Q 208 36 218 52 Q 200 44 182 52 Z" fill="url(#sg-collar-grad)" />
          {/* V scoop detail */}
          <path d="M 188 66 Q 200 82 212 66" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        </>
      ) : (
        <path d="M 182 52 Q 192 44 200 42 Q 208 44 218 52 L 212 62 Q 200 54 188 62 Z" fill={colors.collar} />
      )}

      {/* Strap shading */}
      <path
        d="M 188 46 Q 175 50 165 64 L 156 78 L 148 94 L 138 92 Q 145 70 160 56 Q 174 44 190 42 Z"
        fill="rgba(0,0,0,0.07)"
      />
      <path
        d="M 212 46 Q 225 50 235 64 L 244 78 L 252 94 L 262 92 Q 255 70 240 56 Q 226 44 210 42 Z"
        fill="rgba(0,0,0,0.07)"
      />

      {/* Bottom hem */}
      <path
        d="M 124 470 Q 188 486 200 486 Q 212 486 276 470 L 276 482 Q 278 484 266 484 L 134 484 Q 122 484 122 482 Z"
        fill={colors.collar}
        opacity={0.52}
      />

      {/* Seams */}
      <path d="M 124 200 L 122 474" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />
      <path d="M 276 200 L 278 474" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />

      {/* Specular */}
      <path
        d="M 172 56 Q 170 250 174 474"
        fill="none"
        stroke="rgba(255,255,255,0.13)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 176 56 Q 174 250 178 474"
        fill="none"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COLLARED — polo style
// ─────────────────────────────────────────────────────────────────────────────
const Collared = ({ colors, view }: TemplateProps) => (
  <div style={{ position: "relative", width: "100%", height: "100%", userSelect: "none" }}>
    <svg
      viewBox="0 0 400 500"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="co-slL" x1="1" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>
        <linearGradient id="co-slR" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>
        <radialGradient id="co-body-shine" cx="35%" cy="22%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.26)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </radialGradient>
        <linearGradient id="co-body-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.20)" />
          <stop offset="12%" stopColor="rgba(0,0,0,0)" />
          <stop offset="88%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>
        <linearGradient id="co-body-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="72%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
        </linearGradient>
        <linearGradient id="co-collar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.30)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
        </linearGradient>
        <linearGradient id="co-hem-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>

      {/* Sleeves */}
      <path d="M 62 100 L 8 228 Q 2 244 14 250 L 72 256 Q 86 252 90 238 L 118 168 Z" fill={colors.sleeves} />
      <path d="M 104 160 L 86 234 L 72 256 Q 86 252 90 238 L 118 168 Z" fill={colors.sidePanel} opacity={0.5} />
      <path d="M 62 100 L 8 228 Q 2 244 14 250 L 72 256 Q 86 252 90 238 L 118 168 Z" fill="url(#co-slL)" />
      <path
        d="M 8 228 Q 2 244 14 250 L 72 256 Q 86 252 90 238 L 82 234 Q 72 246 56 248 L 16 242 Q 8 236 12 224 Z"
        fill={colors.collar}
        opacity={0.9}
      />
      <path
        d="M 8 228 Q 2 244 14 250 L 72 256 Q 86 252 90 238 L 82 234 Q 72 246 56 248 L 16 242 Q 8 236 12 224 Z"
        fill="url(#co-hem-grad)"
      />

      <path d="M 338 100 L 392 228 Q 398 244 386 250 L 328 256 Q 314 252 310 238 L 282 168 Z" fill={colors.sleeves} />
      <path d="M 296 160 L 314 234 L 328 256 Q 314 252 310 238 L 282 168 Z" fill={colors.sidePanel} opacity={0.5} />
      <path d="M 338 100 L 392 228 Q 398 244 386 250 L 328 256 Q 314 252 310 238 L 282 168 Z" fill="url(#co-slR)" />
      <path
        d="M 392 228 Q 398 244 386 250 L 328 256 Q 314 252 310 238 L 318 234 Q 328 246 344 248 L 384 242 Q 392 236 388 224 Z"
        fill={colors.collar}
        opacity={0.9}
      />
      <path
        d="M 392 228 Q 398 244 386 250 L 328 256 Q 314 252 310 238 L 318 234 Q 328 246 344 248 L 384 242 Q 392 236 388 224 Z"
        fill="url(#co-hem-grad)"
      />

      {/* Body */}
      <path
        d="M 120 160 Q 200 140 280 160 L 290 480 Q 290 492 278 492 L 122 492 Q 110 492 110 480 Z"
        fill={colors.body}
      />
      <path d="M 110 175 L 110 492 L 140 492 L 136 175 Z" fill={colors.sidePanel} opacity={0.85} />
      <path d="M 290 175 L 290 492 L 260 492 L 264 175 Z" fill={colors.sidePanel} opacity={0.85} />
      <path
        d="M 120 160 Q 200 140 280 160 L 290 480 Q 290 492 278 492 L 122 492 Q 110 492 110 480 Z"
        fill="url(#co-body-shine)"
      />
      <path
        d="M 120 160 Q 200 140 280 160 L 290 480 Q 290 492 278 492 L 122 492 Q 110 492 110 480 Z"
        fill="url(#co-body-side)"
      />
      <path
        d="M 120 160 Q 200 140 280 160 L 290 480 Q 290 492 278 492 L 122 492 Q 110 492 110 480 Z"
        fill="url(#co-body-bottom)"
      />
      <path
        d="M 111 476 Q 200 494 289 476 L 289 490 Q 290 492 278 492 L 122 492 Q 110 492 110 490 Z"
        fill={colors.collar}
        opacity={0.55}
      />

      {/* Polo collar */}
      <path d="M 148 158 L 200 232 L 252 158 L 260 175 L 200 252 L 140 175 Z" fill={colors.collar} />
      <path d="M 148 158 L 200 232 L 252 158 L 260 175 L 200 252 L 140 175 Z" fill="url(#co-collar-grad)" />
      {/* collar fold highlight */}
      <path d="M 155 164 L 200 228 L 245 164" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <path d="M 168 158 L 200 202 L 232 158" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1" />

      {/* Placket */}
      {view === "front" && (
        <>
          <rect x="195" y="232" width="10" height="70" rx="2" fill={colors.collar} />
          <rect x="195" y="232" width="10" height="70" rx="2" fill="url(#co-collar-grad)" opacity={0.6} />
          <circle cx="200" cy="256" r="4" fill="rgba(0,0,0,0.15)" />
          <circle cx="200" cy="278" r="4" fill="rgba(0,0,0,0.15)" />
          <circle cx="200" cy="256" r="3" fill={colors.collar} />
          <circle cx="200" cy="278" r="3" fill={colors.collar} />
        </>
      )}

      {/* Seams */}
      <path d="M 118 168 L 148 158" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      <path d="M 282 168 L 252 158" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      <path d="M 112 178 L 110 480" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />
      <path d="M 288 178 L 290 480" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />

      {/* Specular */}
      <path
        d="M 172 168 Q 170 310 174 488"
        fill="none"
        stroke="rgba(255,255,255,0.13)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 176 168 Q 174 310 178 488"
        fill="none"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MUSLIMAH — full coverage with integrated hijab
// ─────────────────────────────────────────────────────────────────────────────
const Muslimah = ({ colors, view }: TemplateProps) => (
  <div style={{ position: "relative", width: "100%", height: "100%", userSelect: "none" }}>
    <svg
      viewBox="0 0 400 560"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="mj-hijab-shine" cx="50%" cy="18%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
        </radialGradient>
        <linearGradient id="mj-slL" x1="1" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.24)" />
        </linearGradient>
        <linearGradient id="mj-slR" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.24)" />
        </linearGradient>
        <radialGradient id="mj-body-shine" cx="35%" cy="40%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.03)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </radialGradient>
        <linearGradient id="mj-body-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.20)" />
          <stop offset="12%" stopColor="rgba(0,0,0,0)" />
          <stop offset="88%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>
        <linearGradient id="mj-body-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="72%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.16)" />
        </linearGradient>
        <linearGradient id="mj-hem-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>

      {/* ── HIJAB / HOOD ── */}
      <path
        d="M 200 22 Q 268 20 316 48 Q 356 74 364 118 L 352 156 Q 320 138 300 126 L 294 110 Q 268 88 228 80 L 200 76 L 172 80 Q 132 88 106 110 L 100 126 Q 80 138 48 156 L 36 118 Q 44 74 84 48 Q 132 20 200 22 Z"
        fill={colors.collar}
      />
      <path
        d="M 200 22 Q 268 20 316 48 Q 356 74 364 118 L 352 156 Q 320 138 300 126 L 294 110 Q 268 88 228 80 L 200 76 L 172 80 Q 132 88 106 110 L 100 126 Q 80 138 48 156 L 36 118 Q 44 74 84 48 Q 132 20 200 22 Z"
        fill="url(#mj-hijab-shine)"
      />

      {/* Hijab side drapes */}
      <path
        d="M 48 156 Q 26 198 30 284 Q 32 322 46 348 L 78 360 Q 70 316 72 258 L 100 126 Q 80 138 48 156 Z"
        fill={colors.collar}
      />
      <path
        d="M 48 156 Q 26 198 30 284 Q 32 322 46 348 L 78 360 Q 70 316 72 258 L 100 126 Q 80 138 48 156 Z"
        fill="url(#mj-slL)"
        opacity={0.6}
      />
      <path
        d="M 352 156 Q 374 198 370 284 Q 368 322 354 348 L 322 360 Q 330 316 328 258 L 300 126 Q 320 138 352 156 Z"
        fill={colors.collar}
      />
      <path
        d="M 352 156 Q 374 198 370 284 Q 368 322 354 348 L 322 360 Q 330 316 328 258 L 300 126 Q 320 138 352 156 Z"
        fill="url(#mj-slR)"
        opacity={0.6}
      />

      {/* Face opening */}
      {view === "front" ? (
        <>
          <ellipse cx="200" cy="66" rx="36" ry="38" fill="#2a1a0e" opacity={0.9} />
          <ellipse cx="200" cy="66" rx="30" ry="32" fill="#3d2510" opacity={0.8} />
          <ellipse cx="194" cy="56" rx="12" ry="9" fill="rgba(255,255,255,0.06)" />
        </>
      ) : (
        <path d="M 164 76 Q 200 68 236 76 L 232 62 Q 200 56 168 62 Z" fill={colors.collar} opacity={0.5} />
      )}

      {/* Hijab fold lines */}
      <path d="M 156 28 Q 164 55 168 76" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <path d="M 244 28 Q 236 55 232 76" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

      {/* ── LONG SLEEVES ── */}
      <path d="M 100 126 L 40 380 Q 34 400 48 406 L 108 398 Q 122 393 126 376 L 148 176 Z" fill={colors.sleeves} />
      <path d="M 134 168 L 110 368 L 108 398 Q 122 393 126 376 L 148 176 Z" fill={colors.sidePanel} opacity={0.5} />
      <path d="M 100 126 L 40 380 Q 34 400 48 406 L 108 398 Q 122 393 126 376 L 148 176 Z" fill="url(#mj-slL)" />
      <path
        d="M 40 380 Q 34 400 48 406 L 108 398 Q 122 393 126 376 L 118 372 Q 108 386 88 389 L 46 395 Q 36 389 40 375 Z"
        fill={colors.collar}
        opacity={0.9}
      />
      <path
        d="M 40 380 Q 34 400 48 406 L 108 398 Q 122 393 126 376 L 118 372 Q 108 386 88 389 L 46 395 Q 36 389 40 375 Z"
        fill="url(#mj-hem-grad)"
      />
      <path
        d="M 92 246 Q 78 292 72 340"
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path d="M 300 126 L 360 380 Q 366 400 352 406 L 292 398 Q 278 393 274 376 L 252 176 Z" fill={colors.sleeves} />
      <path d="M 266 168 L 290 368 L 292 398 Q 278 393 274 376 L 252 176 Z" fill={colors.sidePanel} opacity={0.5} />
      <path d="M 300 126 L 360 380 Q 366 400 352 406 L 292 398 Q 278 393 274 376 L 252 176 Z" fill="url(#mj-slR)" />
      <path
        d="M 360 380 Q 366 400 352 406 L 292 398 Q 278 393 274 376 L 282 372 Q 292 386 312 389 L 354 395 Q 364 389 360 375 Z"
        fill={colors.collar}
        opacity={0.9}
      />
      <path
        d="M 360 380 Q 366 400 352 406 L 292 398 Q 278 393 274 376 L 282 372 Q 292 386 312 389 L 354 395 Q 364 389 360 375 Z"
        fill="url(#mj-hem-grad)"
      />
      <path
        d="M 308 246 Q 322 292 328 340"
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* ── BODY (longer tunic) ── */}
      <path d="M 148 150 L 252 150 L 264 532 Q 264 544 252 544 L 148 544 Q 136 544 136 532 Z" fill={colors.body} />
      <path d="M 136 175 L 136 544 L 160 544 L 157 172 Z" fill={colors.sidePanel} opacity={0.82} />
      <path d="M 264 175 L 264 544 L 240 544 L 243 172 Z" fill={colors.sidePanel} opacity={0.82} />
      <path
        d="M 148 150 L 252 150 L 264 532 Q 264 544 252 544 L 148 544 Q 136 544 136 532 Z"
        fill="url(#mj-body-shine)"
      />
      <path
        d="M 148 150 L 252 150 L 264 532 Q 264 544 252 544 L 148 544 Q 136 544 136 532 Z"
        fill="url(#mj-body-side)"
      />
      <path
        d="M 148 150 L 252 150 L 264 532 Q 264 544 252 544 L 148 544 Q 136 544 136 532 Z"
        fill="url(#mj-body-bottom)"
      />
      <path
        d="M 137 528 Q 200 546 263 528 L 263 540 Q 264 544 252 544 L 148 544 Q 136 544 136 540 Z"
        fill={colors.collar}
        opacity={0.5}
      />

      {/* Seams */}
      <path d="M 138 178 L 136 530" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />
      <path d="M 262 178 L 264 530" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />

      {/* Specular */}
      <path
        d="M 168 155 Q 166 340 170 532"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 172 155 Q 170 340 174 532"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SLEEVELESS
// ─────────────────────────────────────────────────────────────────────────────
const Sleeveless = ({ colors, view }: TemplateProps) => (
  <div style={{ position: "relative", width: "100%", height: "100%", userSelect: "none" }}>
    <svg
      viewBox="0 0 400 500"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sl-body-shine" cx="35%" cy="22%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.26)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </radialGradient>
        <linearGradient id="sl-body-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.20)" />
          <stop offset="14%" stopColor="rgba(0,0,0,0)" />
          <stop offset="86%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>
        <linearGradient id="sl-body-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="72%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
        </linearGradient>
        <linearGradient id="sl-shL" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.16)" />
        </linearGradient>
        <linearGradient id="sl-shR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.16)" />
        </linearGradient>
        <linearGradient id="sl-armholeL" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.16)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="sl-armholeR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.16)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="sl-collar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.20)" />
        </linearGradient>
      </defs>

      {/* ── SHOULDER PANELS (wider than singlet) ── */}
      <path d="M 148 76 L 108 88 Q 86 100 74 128 L 68 166 Q 82 184 108 190 L 134 186 L 136 116 Z" fill={colors.body} />
      <path d="M 148 76 L 108 88 Q 86 100 74 128 L 68 166 Q 82 184 108 190 L 134 186 L 136 116 Z" fill="url(#sl-shL)" />
      <path
        d="M 252 76 L 292 88 Q 314 100 326 128 L 332 166 Q 318 184 292 190 L 266 186 L 264 116 Z"
        fill={colors.body}
      />
      <path
        d="M 252 76 L 292 88 Q 314 100 326 128 L 332 166 Q 318 184 292 190 L 266 186 L 264 116 Z"
        fill="url(#sl-shR)"
      />

      {/* ── BODY ── */}
      <path
        d="M 136 92 L 148 76 L 252 76 L 264 92 L 274 480 Q 274 492 262 492 L 138 492 Q 126 492 126 480 Z"
        fill={colors.body}
      />
      <path d="M 126 190 L 126 492 L 152 492 L 148 188 Z" fill={colors.sidePanel} opacity={0.85} />
      <path d="M 274 190 L 274 492 L 248 492 L 252 188 Z" fill={colors.sidePanel} opacity={0.85} />
      <path
        d="M 136 92 L 148 76 L 252 76 L 264 92 L 274 480 Q 274 492 262 492 L 138 492 Q 126 492 126 480 Z"
        fill="url(#sl-body-shine)"
      />
      <path
        d="M 136 92 L 148 76 L 252 76 L 264 92 L 274 480 Q 274 492 262 492 L 138 492 Q 126 492 126 480 Z"
        fill="url(#sl-body-side)"
      />
      <path
        d="M 136 92 L 148 76 L 252 76 L 264 92 L 274 480 Q 274 492 262 492 L 138 492 Q 126 492 126 480 Z"
        fill="url(#sl-body-bottom)"
      />
      <path
        d="M 127 476 Q 200 494 273 476 L 273 488 Q 274 492 262 492 L 138 492 Q 126 492 126 488 Z"
        fill={colors.collar}
        opacity={0.55}
      />

      {/* ── ARMHOLE CURVES ── */}
      <path
        d="M 74 128 Q 84 156 108 176 L 134 186 L 134 200 Q 106 194 86 170 Q 68 148 70 126 Z"
        fill="url(#sl-armholeL)"
      />
      <path
        d="M 326 128 Q 316 156 292 176 L 266 186 L 266 200 Q 294 194 314 170 Q 332 148 330 126 Z"
        fill="url(#sl-armholeR)"
      />

      {/* Armhole binding */}
      <path
        d="M 136 116 Q 106 118 82 136 Q 66 154 68 174 Q 80 188 108 192 L 134 188"
        fill="none"
        stroke={colors.collar}
        strokeWidth="7"
        strokeOpacity={0.78}
        strokeLinecap="round"
      />
      <path
        d="M 136 116 Q 106 118 82 136 Q 66 154 68 174 Q 80 188 108 192 L 134 188"
        fill="none"
        stroke="rgba(0,0,0,0.14)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M 264 116 Q 294 118 318 136 Q 334 154 332 174 Q 320 188 292 192 L 266 188"
        fill="none"
        stroke={colors.collar}
        strokeWidth="7"
        strokeOpacity={0.78}
        strokeLinecap="round"
      />
      <path
        d="M 264 116 Q 294 118 318 136 Q 334 154 332 174 Q 320 188 292 192 L 266 188"
        fill="none"
        stroke="rgba(0,0,0,0.14)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      {/* Shoulder seams */}
      <path d="M 136 92 L 148 76" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      <path d="M 252 76 L 264 92" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />

      {/* ── COLLAR / NECK ── */}
      {view === "front" ? (
        <>
          <path d="M 182 76 Q 200 60 218 76 L 212 92 Q 200 80 188 92 Z" fill={colors.collar} />
          <path d="M 182 76 Q 200 60 218 76 L 212 92 Q 200 80 188 92 Z" fill="url(#sl-collar-grad)" />
          <path d="M 188 92 Q 200 102 212 92 L 208 98 Q 200 107 192 98 Z" fill="rgba(0,0,0,0.10)" />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M ${185 + i * 8} ${90 - i} Q 200 ${84 + i * 3} ${215 - i * 8} ${90 - i}`}
              fill="none"
              stroke="rgba(0,0,0,0.07)"
              strokeWidth="0.7"
            />
          ))}
        </>
      ) : (
        <>
          <path d="M 182 76 Q 200 66 218 76 L 212 90 Q 200 78 188 90 Z" fill={colors.collar} />
          <path d="M 182 76 Q 200 66 218 76 L 212 90 Q 200 78 188 90 Z" fill="url(#sl-collar-grad)" />
        </>
      )}

      {/* Seams */}
      <path d="M 128 196 L 126 480" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />
      <path d="M 272 196 L 274 480" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" strokeDasharray="4 3" />

      {/* Specular */}
      <path
        d="M 172 82 Q 170 270 174 480"
        fill="none"
        stroke="rgba(255,255,255,0.13)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 176 82 Q 174 270 178 480"
        fill="none"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS  — same public API as before
// ─────────────────────────────────────────────────────────────────────────────

export const JerseyTemplate = ({ type, colors, view }: { type: JerseyType; colors: ZoneColors; view: JerseyView }) => {
  switch (type) {
    case "long-sleeve":
      return <LongSleeve colors={colors} view={view} />;
    case "singlet":
      return <Singlet colors={colors} view={view} />;
    case "collared":
      return <Collared colors={colors} view={view} />;
    case "muslimah":
      return <Muslimah colors={colors} view={view} />;
    case "sleeveless":
      return <Sleeveless colors={colors} view={view} />;
    default:
      return <Standard colors={colors} view={view} />;
  }
};

export const JERSEY_TYPE_LABELS: Record<JerseyType, string> = {
  standard: "Short Sleeve Jersey",
  "long-sleeve": "Long Sleeve Jersey",
  singlet: "Singlet",
  collared: "Collared (Polo)",
  muslimah: "Muslimah Jersey",
  sleeveless: "Sleeveless Jersey",
};
