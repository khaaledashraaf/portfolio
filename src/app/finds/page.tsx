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

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Internet Finds",
    description:
      "A gallery of things I've found online that I think are worth sharing.",
    url: "https://khaledashraf.me/finds",
    author: {
      "@type": "Person",
      name: "Khaled Ashraf",
      url: "https://khaledashraf.me",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.slice(0, 50).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        ...("sourceUrl" in item && item.sourceUrl && { url: item.sourceUrl }),
      })),
    },
  };

  return (
    <div className="flex flex-col gap-8 pt-16 sm:pt-24 mb-48 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd),
        }}
      />
      <FindsHeader />
      <FindsGrid items={items} types={types} />
    </div>
  );
}
