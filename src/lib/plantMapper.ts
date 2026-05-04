import { CommitData } from "./github";

const POSITIVE_KEYWORDS = ["add", "feat", "feature", "improve", "update", "enhance", "create", "init", "implement", "new", "upgrade", "clean"];
const NEGATIVE_KEYWORDS = ["fix", "bug", "patch", "hotfix", "revert", "hack", "workaround", "broken", "error", "fail", "crash", "issue", "problem", "refactor"];

export type PlantSentiment = "positive" | "negative" | "neutral";

export interface PlantData extends CommitData {
  stemHeight: number;
  sentiment: PlantSentiment;
  petalColor: string;
  stemColor: string;
}

// 12-color signature palette (4 per sentiment family)
export const SIGNATURE = {
  positive: ["#7EC8A4", "#5BB5D5", "#4ECDC4", "#95E1D3"] as const,
  negative: ["#E07A7A", "#C47EC8", "#D4608A", "#BF6BBF"] as const,
  neutral:  ["#D4C5A9", "#C9B99A", "#E0D5C0", "#BFB49A"] as const,
};

const STEMS: Record<PlantSentiment, string> = {
  positive: "#4a7c59",
  negative: "#6b4a4a",
  neutral:  "#6b6b52",
};

function getSentiment(message: string): PlantSentiment {
  const lower = message.toLowerCase();
  const posScore = POSITIVE_KEYWORDS.filter((k) => lower.includes(k)).length;
  const negScore = NEGATIVE_KEYWORDS.filter((k) => lower.includes(k)).length;
  if (posScore > negScore) return "positive";
  if (negScore > posScore) return "negative";
  return "neutral";
}

function normalizeHeight(linesChanged: number, max: number): number {
  const MIN = 40, MAX = 140;
  if (max === 0) return MIN;
  return MIN + (linesChanged / max) * (MAX - MIN);
}

export function mapCommitsToPlants(commits: CommitData[]): PlantData[] {
  const maxLines = commits.length > 0
    ? Math.max(...commits.map((c) => c.linesChanged), 1)
    : 1;

  return commits.map((commit, i) => {
    const sentiment = getSentiment(commit.message);
    return {
      ...commit,
      stemHeight: normalizeHeight(commit.linesChanged, maxLines),
      sentiment,
      petalColor: SIGNATURE[sentiment][i % SIGNATURE[sentiment].length],
      stemColor: STEMS[sentiment],
    };
  });
}
