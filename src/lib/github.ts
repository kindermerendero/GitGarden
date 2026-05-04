import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
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

export async function fetchCommits(owner: string, repo: string): Promise<CommitData[]> {
  const { data: commits } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    per_page: 30,
  });

  const commitDetails = await Promise.all(
    commits.map(async (commit) => {
      const { data: detail } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commit.sha,
      });

      const additions = detail.stats?.additions ?? 0;
      const deletions = detail.stats?.deletions ?? 0;

      return {
        sha: commit.sha,
        message: commit.commit.message.split("\n")[0],
        author: commit.commit.author?.name ?? "unknown",
        date: commit.commit.author?.date ?? "",
        additions,
        deletions,
        linesChanged: additions + deletions,
      };
    })
  );

  return commitDetails;
}
