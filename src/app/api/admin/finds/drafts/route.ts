import { NextResponse } from "next/server";
import { Octokit } from "octokit";
import { validateAuth, unauthorized } from "../helpers";
import type { Find } from "@/content/finds";

const FILE_PATH = "src/content/drafts.json";

type DraftEntry = {
  draftId: string;
  draftSavedAt: string;
  find: Find;
};

async function getFileData(octokit: Octokit, owner: string, repo: string) {
  const { data: file } = await octokit.rest.repos.getContent({ owner, repo, path: FILE_PATH });
  if (Array.isArray(file) || file.type !== "file") throw new Error("Unexpected file response");
  const content = Buffer.from(file.content, "base64").toString("utf-8");
  const drafts: DraftEntry[] = JSON.parse(content);
  return { drafts, sha: file.sha };
}

async function writeFile(octokit: Octokit, owner: string, repo: string, sha: string, drafts: DraftEntry[], message: string) {
  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: FILE_PATH,
    message,
    content: Buffer.from(JSON.stringify(drafts, null, 2) + "\n").toString("base64"),
    sha,
  });
}

// GET — list all drafts
export async function GET(request: Request) {
  if (!validateAuth(request)) return unauthorized();

  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;
    const { drafts } = await getFileData(octokit, owner, repo);
    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("Drafts GET error:", error);
    return NextResponse.json({ error: "Failed to load drafts" }, { status: 500 });
  }
}

// POST — save or update a draft
export async function POST(request: Request) {
  if (!validateAuth(request)) return unauthorized();

  try {
    const { find, draftId } = await request.json();
    if (!find) return NextResponse.json({ error: "Find is required" }, { status: 400 });

    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;
    const { drafts, sha } = await getFileData(octokit, owner, repo);

    const id = draftId || `draft-${Date.now()}`;
    const entry: DraftEntry = { draftId: id, draftSavedAt: new Date().toISOString(), find };
    const idx = drafts.findIndex((d) => d.draftId === id);
    if (idx >= 0) drafts[idx] = entry;
    else drafts.unshift(entry);

    await writeFile(octokit, owner, repo, sha, drafts, `Draft: ${find.title || "Untitled"}`);
    return NextResponse.json({ draftId: id });
  } catch (error) {
    console.error("Drafts POST error:", error);
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}

// DELETE — remove a draft
export async function DELETE(request: Request) {
  if (!validateAuth(request)) return unauthorized();

  try {
    const { draftId } = await request.json();
    if (!draftId) return NextResponse.json({ error: "draftId is required" }, { status: 400 });

    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;
    const { drafts, sha } = await getFileData(octokit, owner, repo);

    const filtered = drafts.filter((d) => d.draftId !== draftId);
    await writeFile(octokit, owner, repo, sha, filtered, `Delete draft: ${draftId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Drafts DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
  }
}
