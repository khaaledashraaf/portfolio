import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { validateAuth, unauthorized } from "../helpers";

export async function DELETE(request: Request) {
  if (!validateAuth(request)) return unauthorized();

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Find ID is required" }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase.from("finds").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete find error:", error);
    return NextResponse.json({ error: "Failed to delete find" }, { status: 500 });
  }
}
