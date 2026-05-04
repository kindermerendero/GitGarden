import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});

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
      target: {
        history: {
          nodes: GraphQLCommitNode[];
        };
      };
    } | null;
  } | null;
}

// Single GraphQL request — fetches 30 commits with stats in one round-trip
export async function fetchCommits(owner: string, repo: string): Promise<CommitData[]> {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error(
      "GITHUB_TOKEN mancante. Aggiungilo in .env.local per usare GitGarden."
    );
  }

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
    { owner, repo }
  );

  const branch = data?.repository?.defaultBranchRef;
  if (!branch) throw new Error(`Repository "${owner}/${repo}" non trovato o senza branch di default.`);

  const nodes = branch.target.history.nodes;

  return nodes.map((n) => ({
    sha: n.oid,
    message: n.messageHeadline,
    author: n.author?.name ?? "unknown",
    date: n.author?.date ?? "",
    additions: n.additions,
    deletions: n.deletions,
    linesChanged: n.additions + n.deletions,
  }));
}
