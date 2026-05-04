import { NextRequest, NextResponse } from "next/server";
import { fetchCommits } from "@/lib/github";
import { mapCommitsToPlants, PlantData } from "@/lib/plantMapper";
import { getTimeTheme } from "@/lib/timeTheme";

const PX = 6;
const GAP = 2;
const PAD_X = 20;
const PAD_Y = 18;

const SPRITES: number[][][] = [
  [[0,1,0],[1,2,1],[0,1,0]],
  [[1,0,1],[0,2,0],[1,0,1]],
  [[0,0,1,0,0],[0,1,1,1,0],[1,1,2,1,1],[0,1,1,1,0],[0,0,1,0,0]],
  [[0,1,0,1,0],[1,1,2,1,1],[0,2,3,2,0],[1,1,2,1,1],[0,1,0,1,0]],
  [[0,1,1,1,0],[1,2,2,2,1],[1,2,3,2,1],[1,2,2,2,1],[0,1,1,1,0]],
  [[0,0,1,1,1,0,0],[0,1,1,2,1,1,0],[1,1,2,2,2,1,1],[1,2,2,3,2,2,1],[1,1,2,2,2,1,1],[0,1,1,2,1,1,0],[0,0,1,1,1,0,0]],
];

const CENTERS: Record<string, [string, string]> = {
  positive: ["#fef3c7", "#f59e0b"],
  negative: ["#fecaca", "#f87171"],
  neutral:  ["#e7e0d0", "#d4b896"],
};

const GRASS = ["#3a8c22","#2d7a1a","#44a028","#328024","#26661a"];
const DIRT  = ["#5a3a1e","#4a2e14","#634020","#523418","#3e2810"];

function darken(hex: string): string {
  const n = parseInt(hex.replace("#",""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 40);
  const g = Math.max(0, ((n >> 8)  & 0xff) - 40);
  const b = Math.max(0, ( n        & 0xff) - 40);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

function dims(plant: PlantData) {
  const si = (plant.sha.charCodeAt(0) + plant.sha.charCodeAt(1)) % SPRITES.length;
  const sprite = SPRITES[si];
  const sRows = sprite.length;
  const sCols = sprite[0].length;
  const flowerW = sCols * PX;
  const flowerH = sRows * PX;
  const stemBlocks = Math.max(7, Math.round(plant.stemHeight / PX));
  const canvasW = Math.max(flowerW + PX * 6, PX * 9);
  const canvasH = flowerH + stemBlocks * PX;
  return { sprite, flowerW, flowerH, stemBlocks, canvasW, canvasH };
}

function renderPlant(plant: PlantData, xOff: number, baseY: number): string {
  const { sprite, flowerW, flowerH, stemBlocks, canvasW } = dims(plant);
  const { petalColor, stemColor, sentiment } = plant;

  const cx   = Math.floor(canvasW / 2);
  const stemX = xOff + cx - Math.floor(PX / 2);
  const fx    = xOff + cx - Math.floor(flowerW / 2);
  const stemTopY   = baseY - stemBlocks * PX;
  const flowerTopY = stemTopY - flowerH;

  const leaf1 = Math.floor(stemBlocks * 0.32);
  const leaf2 = Math.floor(stemBlocks * 0.60);

  const [cOuter, cInner] = CENTERS[sentiment] ?? CENTERS.neutral;
  const r: string[] = [];

  // Stem
  for (let i = 0; i < stemBlocks; i++) {
    const y = stemTopY + i * PX;
    r.push(`<rect x="${stemX}" y="${y}" width="${PX}" height="${PX}" fill="${stemColor}" opacity="${i%2===0?0.9:0.75}"/>`);
    r.push(`<rect x="${stemX+PX}" y="${y+1}" width="1" height="${PX-1}" fill="${darken(stemColor)}" opacity="0.35"/>`);
  }

  // Leaves
  r.push(`<rect x="${stemX-PX}"   y="${stemTopY+leaf1*PX}"    width="${PX}" height="${PX}" fill="${stemColor}" opacity="0.80"/>`);
  r.push(`<rect x="${stemX-PX*2}" y="${stemTopY+leaf1*PX+PX}" width="${PX}" height="${PX}" fill="${stemColor}" opacity="0.55"/>`);
  r.push(`<rect x="${stemX+PX}"   y="${stemTopY+leaf2*PX}"    width="${PX}" height="${PX}" fill="${stemColor}" opacity="0.80"/>`);
  r.push(`<rect x="${stemX+PX*2}" y="${stemTopY+leaf2*PX-PX}" width="${PX}" height="${PX}" fill="${stemColor}" opacity="0.55"/>`);

  // Flower shadow layer
  sprite.forEach((row, ri) => row.forEach((cell, ci) => {
    if (!cell) return;
    r.push(`<rect x="${fx+ci*PX+1}" y="${flowerTopY+ri*PX+1}" width="${PX}" height="${PX}" fill="${cell>=2?darken(cOuter):darken(petalColor)}" opacity="0.30"/>`);
  }));

  // Flower pixels
  sprite.forEach((row, ri) => row.forEach((cell, ci) => {
    if (!cell) return;
    const fill = cell===3 ? cInner : cell===2 ? cOuter : petalColor;
    r.push(`<rect x="${fx+ci*PX}" y="${flowerTopY+ri*PX}" width="${PX}" height="${PX}" fill="${fill}"/>`);
  }));

  // Highlights on center pixels
  sprite.forEach((row, ri) => row.forEach((cell, ci) => {
    if (cell < 2) return;
    r.push(`<rect x="${fx+ci*PX}" y="${flowerTopY+ri*PX}" width="2" height="2" fill="white" opacity="0.35"/>`);
  }));

  return r.join("");
}

function parseGlow(rgba: string): { color: string; opacity: number } {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return { color: "#336633", opacity: 0.07 };
  return { color: `rgb(${m[1]},${m[2]},${m[3]})`, opacity: parseFloat(m[4] ?? "1") };
}

function buildSvg(plants: PlantData[], bg: string, glow: string): string {
  const plantDims = plants.map(p => dims(p));
  const totalW = PAD_X * 2 + plantDims.reduce((s, d) => s + d.canvasW + GAP, 0) - GAP;
  const maxH   = Math.max(...plantDims.map(d => d.canvasH));
  const baseY  = PAD_Y + maxH;
  const svgH   = baseY + PX * 3 + PAD_Y; // plants + 3 ground rows + bottom pad
  const blocks = Math.ceil(totalW / PX) + 1;

  const { color: glowColor, opacity: glowOp } = parseGlow(glow);
  const parts: string[] = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${svgH}" ` +
    `shape-rendering="crispEdges" style="image-rendering:pixelated">`
  );

  // Background
  parts.push(`<rect width="${totalW}" height="${svgH}" fill="${bg}"/>`);

  // Atmospheric glow (amplified so it's visible in SVG)
  parts.push(
    `<defs><radialGradient id="gl" cx="50%" cy="100%" r="70%">` +
    `<stop offset="0%" stop-color="${glowColor}" stop-opacity="${Math.min(1, glowOp * 10)}"/>` +
    `<stop offset="100%" stop-color="${bg}" stop-opacity="0"/>` +
    `</radialGradient></defs>`
  );
  parts.push(`<rect width="${totalW}" height="${svgH}" fill="url(#gl)"/>`);

  // Plants
  let x = PAD_X;
  plants.forEach((plant, i) => {
    parts.push(renderPlant(plant, x, baseY));
    x += plantDims[i].canvasW + GAP;
  });

  // Grass row
  for (let i = 0; i < blocks; i++) {
    parts.push(`<rect x="${i*PX}" y="${baseY}" width="${PX}" height="${PX}" fill="${GRASS[(i*7+i*i)%GRASS.length]}" opacity="0.90"/>`);
  }
  // Dirt rows
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < blocks; i++) {
      parts.push(`<rect x="${i*PX}" y="${baseY+(row+1)*PX}" width="${PX}" height="${PX}" fill="${DIRT[(i*3+i+row*13)%DIRT.length]}" opacity="${(0.75-row*0.2).toFixed(2)}"/>`);
    }
  }

  // Watermark
  parts.push(
    `<text x="${totalW-8}" y="${svgH-6}" ` +
    `font-family="Georgia,'Times New Roman',serif" font-size="9" ` +
    `fill="white" opacity="0.18" text-anchor="end">GitGarden</text>`
  );

  parts.push(`</svg>`);
  return parts.join("");
}

export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get("repo");
  if (!repo || !repo.includes("/")) {
    return new NextResponse("Formato non valido: usa owner/repo", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const hourParam = req.nextUrl.searchParams.get("hour");
  const hour = hourParam !== null ? parseInt(hourParam) : new Date().getHours();
  const { bg, glow } = getTimeTheme(hour);

  const [owner, repoName] = repo.split("/");

  try {
    const commits = await fetchCommits(owner, repoName);
    const plants  = mapCommitsToPlants(commits);
    const svg     = buildSvg(plants, bg, glow);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore sconosciuto";
    return new NextResponse(msg, { status: 500, headers: { "Content-Type": "text/plain" } });
  }
}
