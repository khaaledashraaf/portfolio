import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { validateAuth, unauthorized } from "../helpers";

export async function PATCH(request: Request) {
  if (!validateAuth(request)) return unauthorized();

  try {
    const { find } = await request.json();
    if (!find?.id) return NextResponse.json({ error: "Find ID is required" }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("finds")
      .update({
        title: find.title,
        type: find.type,
        note: find.note,
        source_url: find.sourceUrl || null,
        image_url: find.imageUrl || null,
        author: find.author || null,
        excerpt: find.excerpt || null,
        cover_video_url: find.coverVideoUrl || null,
        priority: find.priority || 1,
        featured: find.featured || false,
        expandable: find.expandable || false,
        sticker: find.sticker || null,
        expanded_note: find.expandedNote || null,
        expanded_cards: find.expandedCards || null,
      })
      .eq("id", find.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update find error:", error);
    return NextResponse.json({ error: "Failed to update find" }, { status: 500 });
  }
}
