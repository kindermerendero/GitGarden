export interface TimeTheme {
  period: "night" | "dawn" | "morning" | "midday" | "afternoon" | "dusk" | "evening";
  bg: string;
  glow: string;
}

const THEMES: { from: number; theme: TimeTheme }[] = [
  { from:  0, theme: { period: "night",     bg: "#07080e", glow: "rgba(28,38,120,0.07)"  } },
  { from:  5, theme: { period: "dawn",      bg: "#0e0906", glow: "rgba(160,70,28,0.08)"  } },
  { from:  7, theme: { period: "morning",   bg: "#090f0a", glow: "rgba(50,110,50,0.09)"  } },
  { from: 11, theme: { period: "midday",    bg: "#0b1009", glow: "rgba(60,135,55,0.10)"  } },
  { from: 15, theme: { period: "afternoon", bg: "#100d07", glow: "rgba(145,95,18,0.08)"  } },
  { from: 18, theme: { period: "dusk",      bg: "#0d0810", glow: "rgba(110,38,120,0.08)" } },
  { from: 21, theme: { period: "evening",   bg: "#08090e", glow: "rgba(38,48,135,0.07)"  } },
];

export function getTimeTheme(hour = new Date().getHours()): TimeTheme {
  let result = THEMES[0].theme;
  for (const { from, theme } of THEMES) {
    if (hour >= from) result = theme;
  }
  return result;
}
