import { NextResponse } from "next/server";

export function validateAuth(request: Request): boolean {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.FINDS_ADMIN_PASSWORD;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

interface FindData {
  id: string;
  title: string;
  type: string;
  note: string;
  sourceUrl?: string;
  imageUrl?: string;
  dateAdded: string;
  author?: string;
  excerpt?: string;
  priority?: number;
}

export function buildFindEntry(find: FindData): string {
  const lines: string[] = [];
  lines.push(`  {`);
  lines.push(`    id: "${find.id}",`);
  lines.push(`    title: ${JSON.stringify(find.title)},`);
  lines.push(`    type: "${find.type}",`);
  lines.push(`    note: ${JSON.stringify(find.note)},`);
  if (find.sourceUrl) lines.push(`    sourceUrl: ${JSON.stringify(find.sourceUrl)},`);
  if (find.imageUrl) lines.push(`    imageUrl: ${JSON.stringify(find.imageUrl)},`);
  lines.push(`    dateAdded: "${find.dateAdded}",`);
  if (find.author) lines.push(`    author: ${JSON.stringify(find.author)},`);
  if (find.excerpt) lines.push(`    excerpt: ${JSON.stringify(find.excerpt)},`);
  if (find.priority) lines.push(`    priority: ${find.priority},`);
  lines.push(`  },`);
  return lines.join("\n");
}

export function insertFindIntoFile(
  fileContent: string,
  entryString: string,
  nextId: string
): string {
  const marker = "export const finds: Find[] = [";
  const idx = fileContent.indexOf(marker);
  if (idx === -1) throw new Error("Could not find finds array in file");
  const insertAt = idx + marker.length;
  return (
    fileContent.slice(0, insertAt) +
    "\n" +
    entryString +
    fileContent.slice(insertAt)
  );
}

export function getNextId(fileContent: string): string {
  const idMatches = fileContent.matchAll(/id:\s*"(\d+)"/g);
  let maxId = 0;
  for (const match of idMatches) {
    const num = parseInt(match[1], 10);
    if (num > maxId) maxId = num;
  }
  return String(maxId + 1);
}
