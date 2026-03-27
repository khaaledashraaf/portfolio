import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { validateAuth, unauthorized } from "../helpers";
import type { Find } from "@/content/finds";

export async function GET(request: Request) {
  if (!validateAuth(request)) return unauthorized();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("finds")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    const finds: Find[] = (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      note: row.note,
      sourceUrl: row.source_url ?? undefined,
      imageUrl: row.image_url ?? undefined,
      dateAdded: row.date_added,
      author: row.author ?? undefined,
      excerpt: row.excerpt ?? undefined,
      coverVideoUrl: row.cover_video_url ?? undefined,
      priority: row.priority ?? 1,
      featured: row.featured ?? false,
      expandable: row.expandable ?? false,
      sticker: row.sticker ?? undefined,
      expandedNote: row.expanded_note ?? undefined,
      expandedCards: row.expanded_cards ?? undefined,
      submittedBy: row.submitted_by ?? undefined,
    }));

    return NextResponse.json({ finds });
  } catch (error) {
    console.error("List finds error:", error);
    return NextResponse.json({ error: "Failed to load finds" }, { status: 500 });
  }
}
