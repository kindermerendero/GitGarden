import { NextRequest, NextResponse } from "next/server";
import { fetchCommits } from "@/lib/github";
import { mapCommitsToPlants } from "@/lib/plantMapper";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const repo = searchParams.get("repo");

  if (!repo || !repo.includes("/")) {
    return NextResponse.json({ error: "Formato non valido. Usa owner/repo" }, { status: 400 });
  }

  const [owner, repoName] = repo.split("/");

  try {
    const commits = await fetchCommits(owner, repoName);
    const plants = mapCommitsToPlants(commits);
    return NextResponse.json({ plants });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
