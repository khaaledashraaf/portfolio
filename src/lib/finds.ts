import { supabase } from "./supabase";
import type { Find, FindType, FindItem, FindCollection } from "@/content/finds";

type DbFind = {
  id: string;
  title: string;
  type: string;
  note: string;
  source_url: string | null;
  image_url: string | null;
  date_added: string;
  author: string | null;
  excerpt: string | null;
  cover_video_url: string | null;
  priority: number | null;
  featured: boolean | null;
  expandable: boolean | null;
  sticker: string | null;
  expanded_note: string | null;
  expanded_cards: unknown | null;
  submitted_by: string | null;
};

type DbCollectionItem = {
  id: string;
  collection_id: string;
  title: string;
  type: string;
  note: string;
  source_url: string | null;
  image_url: string | null;
  date_added: string;
  sort_order: number;
};

type DbCollection = {
  id: string;
  title: string;
  note: string;
  image_url: string | null;
  date_added: string;
  priority: number | null;
  collection_items: DbCollectionItem[];
};

function dbRowToFind(row: DbFind): Find {
  return {
    id: row.id,
    title: row.title,
    type: row.type as FindType,
    note: row.note,
    sourceUrl: row.source_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    dateAdded: row.date_added,
    author: row.author ?? undefined,
    excerpt: row.excerpt ?? undefined,
    coverVideoUrl: row.cover_video_url ?? undefined,
    priority: (row.priority as 1 | 2 | 3) ?? 1,
    featured: row.featured ?? false,
    expandable: row.expandable ?? false,
    sticker: (row.sticker as Find["sticker"]) ?? undefined,
    expandedNote: row.expanded_note ?? undefined,
    expandedCards: (row.expanded_cards as Find["expandedCards"]) ?? undefined,
    submittedBy: row.submitted_by ?? undefined,
  };
}

export async function getAllFinds(): Promise<Find[]> {
  const { data, error } = await supabase
    .from("finds")
    .select("*")
    .order("priority", { ascending: false })
    .order("date_added", { ascending: false });

  if (error) throw error;
  return (data as DbFind[]).map(dbRowToFind);
}

export async function getAllFindItems(): Promise<FindItem[]> {
  const [findsResult, collectionsResult] = await Promise.all([
    supabase.from("finds").select("*"),
    supabase.from("collections").select("*, collection_items(*)"),
  ]);

  if (findsResult.error) throw findsResult.error;
  if (collectionsResult.error) throw collectionsResult.error;

  const finds = (findsResult.data as DbFind[]).map(dbRowToFind);

  const collections: FindCollection[] = (collectionsResult.data as DbCollection[]).map((c) => ({
    kind: "collection" as const,
    id: c.id,
    title: c.title,
    note: c.note,
    imageUrl: c.image_url ?? undefined,
    dateAdded: c.date_added,
    priority: (c.priority as 1 | 2 | 3) ?? 1,
    items: (c.collection_items ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type as FindType,
        note: item.note,
        sourceUrl: item.source_url ?? undefined,
        imageUrl: item.image_url ?? undefined,
        dateAdded: item.date_added,
      })),
  }));

  const items: FindItem[] = [...finds, ...collections];
  return items.sort((a, b) => {
    const priorityDiff = (b.priority ?? 1) - (a.priority ?? 1);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });
}

export async function getFindsByType(type: FindType): Promise<Find[]> {
  const { data, error } = await supabase
    .from("finds")
    .select("*")
    .eq("type", type)
    .order("priority", { ascending: false })
    .order("date_added", { ascending: false });

  if (error) throw error;
  return (data as DbFind[]).map(dbRowToFind);
}

export async function getAllFindTypes(): Promise<FindType[]> {
  const [findsResult, itemsResult] = await Promise.all([
    supabase.from("finds").select("type"),
    supabase.from("collection_items").select("type"),
  ]);

  if (findsResult.error) throw findsResult.error;
  if (itemsResult.error) throw itemsResult.error;

  const allTypes = new Set<FindType>();
  findsResult.data.forEach((f: { type: string }) => allTypes.add(f.type as FindType));
  itemsResult.data.forEach((f: { type: string }) => allTypes.add(f.type as FindType));
  return Array.from(allTypes).sort();
}
