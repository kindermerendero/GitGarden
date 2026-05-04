import { CommitData } from "./github";

const POSITIVE_KEYWORDS = ["add", "feat", "feature", "improve", "update", "enhance", "create", "init", "implement", "new", "upgrade", "refactor", "clean"];
const NEGATIVE_KEYWORDS = ["fix", "bug", "patch", "hotfix", "revert", "hack", "workaround", "broken", "error", "fail", "crash", "issue", "problem"];

export type PlantSentiment = "positive" | "negative" | "neutral";

export interface PlantData extends CommitData {
  stemHeight: number;
  sentiment: PlantSentiment;
  petalColor: string;
  stemColor: string;
  petalCount: number;
}

function getSentiment(message: string): PlantSentiment {
  const lower = message.toLowerCase();
  const posScore = POSITIVE_KEYWORDS.filter((k) => lower.includes(k)).length;
  const negScore = NEGATIVE_KEYWORDS.filter((k) => lower.includes(k)).length;
  if (posScore > negScore) return "positive";
  if (negScore > posScore) return "negative";
  return "neutral";
}

const PALETTE: Record<PlantSentiment, { petal: string[]; stem: string }> = {
  positive: {
    petal: ["#7EC8A4", "#5BB5D5", "#A8D8B9", "#4ECDC4", "#95E1D3"],
    stem: "#4a7c59",
  },
  negative: {
    petal: ["#E07A7A", "#C47EC8", "#E8A0A0", "#D4608A", "#BF6BBF"],
    stem: "#6b4a4a",
  },
  neutral: {
    petal: ["#D4C5A9", "#C9B99A", "#E0D5C0", "#BFB49A", "#D9CEB2"],
    stem: "#6b6b52",
  },
};

function normalizeHeight(linesChanged: number, max: number): number {
  const MIN_HEIGHT = 40;
  const MAX_HEIGHT = 140;
  if (max === 0) return MIN_HEIGHT;
  return MIN_HEIGHT + ((linesChanged / max) * (MAX_HEIGHT - MIN_HEIGHT));
}

export function mapCommitsToPlants(commits: CommitData[]): PlantData[] {
  const maxLines = Math.max(...commits.map((c) => c.linesChanged), 1);

  return commits.map((commit, i) => {
    const sentiment = getSentiment(commit.message);
    const palette = PALETTE[sentiment];
    const petalColor = palette.petal[i % palette.petal.length];
    const petalCount = 4 + (commit.sha.charCodeAt(0) % 4); // 4–7 petals

    return {
      ...commit,
      stemHeight: normalizeHeight(commit.linesChanged, maxLines),
      sentiment,
      petalColor,
      stemColor: palette.stem,
      petalCount,
    };
  });
}
