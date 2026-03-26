import type { Metadata } from "next";
import { getAllFindItems, getAllFindTypes } from "@/lib/finds";
import { FindsHeader } from "@/components/finds/finds-header";
import { FindsGrid } from "@/components/finds/finds-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internet Finds",
  description:
    "A gallery of things I've found online that I think are worth sharing.",
  alternates: { canonical: "https://khaledashraf.me/finds" },
};

export default async function FindsPage() {
  const [items, types] = await Promise.all([getAllFindItems(), getAllFindTypes()]);

  return (
    <div className="flex flex-col gap-8 pt-16 sm:pt-24 mb-48 w-full">
      <FindsHeader />
      <FindsGrid items={items} types={types} />
    </div>
  );
}
