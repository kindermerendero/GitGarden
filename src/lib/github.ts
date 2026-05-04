import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

export interface CommitData {
  sha: string;
  message: string;
  author: string;
  date: string;
  additions: number;
  deletions: number;
  linesChanged: number;
}

interface GraphQLCommitNode {
  oid: string;
  messageHeadline: string;
  author: { name: string; date: string } | null;
  additions: number;
  deletions: number;
}

interface GraphQLResponse {
  repository: {
    defaultBranchRef: {
      target: { history: { nodes: GraphQLCommitNode[] } };
    } | null;
  } | null;
}

function translateError(err: unknown): Error {
  if (!(err instanceof Error)) return new Error("Errore sconosciuto");
  const msg = err.message.toLowerCase();
  if (err.name === "AbortError" || msg.includes("abort"))
    return new Error("Timeout: GitHub non ha risposto entro 12 secondi.");
  if (msg.includes("bad credentials") || msg.includes("401"))
    return new Error("Token GitHub non valido o scaduto.");
  if (msg.includes("not found") || msg.includes("404"))
    return new Error("Repository non trovato o privato.");
  if (msg.includes("rate limit") || msg.includes("429"))
    return new Error("Rate limit GitHub raggiunto. Riprova tra qualche minuto.");
  return err;
}

export async function fetchCommits(owner: string, repo: string): Promise<CommitData[]> {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN mancante. Aggiungilo in .env.local.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);

  try {
    const data = await octokit.graphql<GraphQLResponse>(
      `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 30) {
                  nodes {
                    oid
                    messageHeadline
                    author { name date }
                    additions
                    deletions
                  }
                }
              }
            }
          }
        }
      }`,
      { owner, repo, request: { signal: controller.signal } }
    );

    clearTimeout(timer);

    const branch = data?.repository?.defaultBranchRef;
    if (!branch) throw new Error(`Repository "${owner}/${repo}" non trovato o senza branch di default.`);

    return branch.target.history.nodes.map((n) => ({
      sha: n.oid,
      message: n.messageHeadline,
      author: n.author?.name ?? "unknown",
      date: n.author?.date ?? "",
      additions: n.additions,
      deletions: n.deletions,
      linesChanged: n.additions + n.deletions,
    }));
  } catch (err) {
    clearTimeout(timer);
    throw translateError(err);
  }
}
