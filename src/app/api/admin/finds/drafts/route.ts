import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { validateAuth, unauthorized } from "../helpers";
import type { Find } from "@/content/finds";

type DraftEntry = {
  draftId: string;
  draftSavedAt: string;
  find: Find;
  finds?: Find[];
};

// GET — list all drafts
export async function GET(request: Request) {
  if (!validateAuth(request)) return unauthorized();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("find_drafts")
      .select("*")
      .order("draft_saved_at", { ascending: false });

    if (error) throw error;

    const drafts: DraftEntry[] = data.map((d) => {
      const findData = d.find_data as Record<string, unknown>;
      const finds = findData.finds as Find[] | undefined;
      const find = finds?.[0] || findData as unknown as Find;
      return {
        draftId: d.draft_id,
        draftSavedAt: d.draft_saved_at,
        find,
        finds,
      };
    });

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
    const { find, finds, draftId } = await request.json();
    if (!find && (!finds || finds.length === 0)) return NextResponse.json({ error: "Find is required" }, { status: 400 });

    const supabase = createAdminClient();
    const id = draftId || `draft-${Date.now()}`;

    // Store finds array inside find_data so we don't need schema changes
    const findData = finds && finds.length > 0 ? { finds } : find;

    const { error } = await supabase.from("find_drafts").upsert({
      draft_id: id,
      draft_saved_at: new Date().toISOString(),
      find_data: findData,
    });

    if (error) throw error;

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

    const supabase = createAdminClient();
    const { error } = await supabase.from("find_drafts").delete().eq("draft_id", draftId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Drafts DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
  }
}
