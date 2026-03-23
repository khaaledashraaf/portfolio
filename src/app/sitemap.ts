import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = "https://khaledashraf.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogEntries = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    priority: 0.6 as const,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/finds`,
      lastModified: new Date(),
      priority: 0.8,
    },
    ...blogEntries,
  ];
}
