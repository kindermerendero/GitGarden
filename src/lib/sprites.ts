// Shared pixel-art data and color utilities
// Single source of truth for Plant.tsx and api/garden/svg/route.ts

export const SPRITES: readonly (readonly (readonly number[])[])[] = [
  [[0,1,0],[1,2,1],[0,1,0]],
  [[1,0,1],[0,2,0],[1,0,1]],
  [[0,0,1,0,0],[0,1,1,1,0],[1,1,2,1,1],[0,1,1,1,0],[0,0,1,0,0]],
  [[0,1,0,1,0],[1,1,2,1,1],[0,2,3,2,0],[1,1,2,1,1],[0,1,0,1,0]],
  [[0,1,1,1,0],[1,2,2,2,1],[1,2,3,2,1],[1,2,2,2,1],[0,1,1,1,0]],
  [
    [0,0,1,1,1,0,0],
    [0,1,1,2,1,1,0],
    [1,1,2,2,2,1,1],
    [1,2,2,3,2,2,1],
    [1,1,2,2,2,1,1],
    [0,1,1,2,1,1,0],
    [0,0,1,1,1,0,0],
  ],
];

export const CENTERS: Record<string, [string, string]> = {
  positive: ["#fef3c7", "#f59e0b"],
  negative: ["#fecaca", "#f87171"],
  neutral:  ["#e7e0d0", "#d4b896"],
};

export const GRASS = ["#3a8c22","#2d7a1a","#44a028","#328024","#26661a"] as const;
export const DIRT  = ["#5a3a1e","#4a2e14","#634020","#523418","#3e2810"] as const;

export function parseHex(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

export function toHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2,"0")}${Math.round(g).toString(16).padStart(2,"0")}${Math.round(b).toString(16).padStart(2,"0")}`;
}

// Shadow: shift toward blue-violet (cold), darken
export function shadowColor(hex: string): string {
  const [r, g, b] = parseHex(hex);
  return toHex(Math.max(0, r * 0.52), Math.max(0, g * 0.48), Math.min(255, b * 0.62 + 38));
}

// Highlight: shift toward yellow-cream (warm), lighten
export function highlightColor(hex: string): string {
  const [r, g, b] = parseHex(hex);
  return toHex(Math.min(255, r * 1.12 + 32), Math.min(255, g * 1.06 + 22), Math.max(0, b * 0.72));
}
