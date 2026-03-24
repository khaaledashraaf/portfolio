import { NextResponse } from "next/server";
import { Octokit } from "octokit";
import {
  validateAuth,
  unauthorized,
  buildFindEntry,
  insertFindIntoFile,
  getNextId,
} from "../helpers";

const FILE_PATH = "src/content/finds.ts";

export async function POST(request: Request) {
  if (!validateAuth(request)) return unauthorized();

  try {
    const { find } = await request.json();
    if (!find?.title || !find?.type || !find?.note) {
      return NextResponse.json(
        { error: "Find must have title, type, and note" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;

    // Get current file
    const { data: file } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: FILE_PATH,
    });

    if (Array.isArray(file) || file.type !== "file") {
      return NextResponse.json(
        { error: "Unexpected file response" },
        { status: 500 }
      );
    }

    const content = Buffer.from(file.content, "base64").toString("utf-8");
    const nextId = getNextId(content);

    const entryString = buildFindEntry({
      ...find,
      id: nextId,
      dateAdded: find.dateAdded || new Date().toISOString().split("T")[0],
    });

    const updatedContent = insertFindIntoFile(content, entryString, nextId);

    // Commit the updated file
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: FILE_PATH,
      message: `Add find: ${find.title}`,
      content: Buffer.from(updatedContent).toString("base64"),
      sha: file.sha,
    });

    return NextResponse.json({ success: true, id: nextId });
  } catch (error) {
    console.error("Commit error:", error);
    return NextResponse.json(
      { error: "Failed to commit find" },
      { status: 500 }
    );
  }
}
