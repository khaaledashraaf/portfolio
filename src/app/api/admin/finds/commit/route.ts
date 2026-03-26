import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { validateAuth, unauthorized } from "../helpers";

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

    const supabase = createAdminClient();

    // Get next numeric ID
    const { data: existing } = await supabase.from("finds").select("id");
    const maxId = (existing ?? []).reduce((max, f) => {
      const num = parseInt(f.id, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const nextId = String(maxId + 1);

    const { error } = await supabase.from("finds").insert({
      id: nextId,
      title: find.title,
      type: find.type,
      note: find.note,
      source_url: find.sourceUrl || null,
      image_url: find.imageUrl || null,
      date_added: find.dateAdded || new Date().toISOString().split("T")[0],
      author: find.author || null,
      excerpt: find.excerpt || null,
      cover_video_url: find.coverVideoUrl || null,
      priority: find.priority || 1,
      featured: find.featured || false,
      expandable: find.expandable || false,
      sticker: find.sticker || null,
      expanded_note: find.expandedNote || null,
      expanded_cards: find.expandedCards || null,
      submitted_by: find.submittedBy || null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, id: nextId });
  } catch (error) {
    console.error("Commit error:", error);
    return NextResponse.json(
      { error: "Failed to commit find" },
      { status: 500 }
    );
  }
}
