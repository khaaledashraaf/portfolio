import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog-card";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on design, engineering, and the space in between.",
  alternates: { canonical: "https://khaledashraf.me/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col gap-8 py-16 sm:py-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground">
          Thoughts on design, engineering, and the space in between.
        </p>
      </div>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
