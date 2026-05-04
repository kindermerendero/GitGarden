import { NextRequest, NextResponse } from "next/server";
import { fetchCommits } from "@/lib/github";
import { mapCommitsToPlants } from "@/lib/plantMapper";

const REPO_RE = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get("repo")?.trim() ?? "";

  if (!REPO_RE.test(repo)) {
    return NextResponse.json({ error: "Formato non valido. Usa owner/repo (es. vercel/next.js)" }, { status: 400 });
  }

  const [owner, repoName] = repo.split("/");

  try {
    const commits = await fetchCommits(owner, repoName);
    const plants  = mapCommitsToPlants(commits);
    return NextResponse.json({ plants });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
