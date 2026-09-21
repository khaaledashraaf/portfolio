"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { glassCard } from "@/components/finds/find-card";

export function BlogCard({ post }: { post: BlogPostMeta }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "tween", duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        href={`/blog/${post.slug}`}
        className={cn(glassCard, "group flex h-full flex-col gap-5 overflow-hidden pb-6")}
      >
        {post.cover && (
          <div className="relative aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]">
            <Image
              src={post.cover}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain p-5"
            />
            {post.coverHover && (
              <Image
                src={post.coverHover}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain p-5 opacity-0 group-hover:animate-[twinkle_0.7s_steps(1)_infinite]"
              />
            )}
          </div>
        )}
        <div className={cn("flex flex-col gap-2 px-6", !post.cover && "pt-6")}>
          <h3 className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{post.description}</p>
          )}
        </div>
        <div className="mt-auto flex items-center gap-4 px-6 font-mono text-xs text-muted-foreground">
          <time className="flex items-center gap-1.5">
            <Calendar className="size-3.5" aria-hidden />
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            {post.readingTime} min read
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
