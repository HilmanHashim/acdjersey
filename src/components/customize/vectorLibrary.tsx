import React from "react";

export type VectorId =
  | "stripe"
  | "chevron"
  | "slash"
  | "dots"
  | "star"
  | "flame"
  | "lightning"
  | "wing"
  | "shield"
  | "tiger";

interface VProps {
  color: string;
  size?: number;
}

/* Each vector renders inside a 100x100 box */
const Stripe = ({ color, size = 100 }: VProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <rect x="0" y="40" width="100" height="20" fill={color} />
  </svg>
);
const Chevron = ({ color, size = 100 }: VProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <polygon points="0,30 50,60 100,30 100,55 50,85 0,55" fill={color} />
  </svg>
);
const Slash = ({ color, size = 100 }: VProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <polygon points="10,90 70,10 90,10 30,90" fill={color} />
  </svg>
);
const Dots = ({ color, size = 100 }: VProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    {[20, 50, 80].map((y) =>
      [20, 50, 80].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill={color} />)
    )}
  </svg>
);
const Star = ({ color, size = 100 }: VProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <polygon points="50,5 61,38 96,38 67,58 78,92 50,72 22,92 33,58 4,38 39,38" fill={color} />
  </svg>
);
const Flame = ({ color, size = 100 }: VProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <path d="M50 10 C30 35 25 55 35 75 C40 90 60 95 70 80 C80 65 70 50 60 40 C58 55 50 60 50 50 C50 35 60 25 50 10 Z" fill={color} />
  </svg>
);
const Lightning = ({ color, size = 100 }: VProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <polygon points="55,5 20,55 45,55 35,95 80,40 55,40 65,5" fill={color} />
  </svg>
);
const Wing = ({ color, size = 100 }: VProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <path d="M5 50 Q30 20 55 35 Q70 25 95 30 Q70 50 55 55 Q35 70 5 50 Z" fill={color} />
  </svg>
);
const Shield = ({ color, size = 100 }: VProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <path d="M50 5 L90 20 L85 60 Q75 85 50 95 Q25 85 15 60 L10 20 Z" fill={color} />
  </svg>
);
const Tiger = ({ color, size = 100 }: VProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    {[10, 30, 50, 70, 90].map((y, i) => (
      <path key={i} d={`M${i % 2 ? 0 : 20} ${y} Q50 ${y - 8} ${i % 2 ? 80 : 100} ${y} L${i % 2 ? 80 : 100} ${y + 6} Q50 ${y - 2} ${i % 2 ? 0 : 20} ${y + 6} Z`} fill={color} />
    ))}
  </svg>
);

export const VectorComponents: Record<VectorId, React.FC<VProps>> = {
  stripe: Stripe,
  chevron: Chevron,
  slash: Slash,
  dots: Dots,
  star: Star,
  flame: Flame,
  lightning: Lightning,
  wing: Wing,
  shield: Shield,
  tiger: Tiger,
};

export const VECTOR_LIST: { id: VectorId; label: string }[] = [
  { id: "stripe", label: "Stripe" },
  { id: "chevron", label: "Chevron" },
  { id: "slash", label: "Slash" },
  { id: "dots", label: "Dots" },
  { id: "star", label: "Star" },
  { id: "flame", label: "Flame" },
  { id: "lightning", label: "Lightning" },
  { id: "wing", label: "Wing" },
  { id: "shield", label: "Shield" },
  { id: "tiger", label: "Tiger" },
];
