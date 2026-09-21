import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import {ArrowLeft} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const url = `https://khaledashraf.me/blog/${slug}`;
  const images = post.ogImage
    ? [{ url: `https://khaledashraf.me${post.ogImage}`, width: 1200, height: 630, alt: post.title }]
    : undefined;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `https://khaledashraf.me/blog/${slug}`,
    author: {
      "@type": "Person",
      name: "Khaled Ashraf",
      url: "https://khaledashraf.me",
    },
  };

  return (
    <article className="py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-8 flex flex-col gap-2">
        <Link
          href="/blog"
          className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground flex items-center"
        >
          <ArrowLeft className="w-4 h-4 inline-block mr-1" /> Back to blog
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
        <time className="font-mono text-xs text-muted-foreground">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
      <div
        className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:underline prose-a:underline-offset-4 prose-blockquote:border-l-amber-400 prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-foreground [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none prose-img:mx-auto prose-img:max-w-[min(100%,28rem)] [&_p:has(>img)+p]:text-center [&_p:has(>img)+p]:text-sm [&_p:has(>img)+p]:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
