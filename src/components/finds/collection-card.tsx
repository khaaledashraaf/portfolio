"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronDown } from "lucide-react";
import type { FindCollection } from "@/content/finds";
import { FindCard } from "./find-card";
import { cn } from "@/lib/utils";

const childContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const childItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

const glassmorphism = cn(
  "rounded-2xl backdrop-blur-xl",
  "bg-gradient-to-br from-white/60 via-white/40 to-white/20 dark:from-white/[0.08] dark:via-white/[0.04] dark:to-white/[0.01]",
  "shadow-[0_8px_32px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.02)]",
  "border border-white/40 dark:border-white/[0.08]"
);

interface CollectionCardProps {
  collection: FindCollection;
  isExpanded: boolean;
  onToggle: () => void;
}

export function CollectionCard({ collection, isExpanded, onToggle }: CollectionCardProps) {
  const coverImage = collection.imageUrl ?? collection.items[0]?.imageUrl;
  const itemCount = collection.items.length;

  return (
    <div>
      <motion.div
        onClick={onToggle}
        whileHover={{ y: -4 }}
        transition={{ type: "tween", duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="cursor-pointer relative"
      >
        {/* Stacked card layers */}
        <div
          className={cn(
            glassmorphism,
            "absolute inset-0 translate-y-2 translate-x-1 rotate-[1.5deg] opacity-40"
          )}
        />
        <div
          className={cn(
            glassmorphism,
            "absolute inset-0 translate-y-1 translate-x-0.5 rotate-[0.75deg] opacity-60"
          )}
        />

        {/* Main card */}
        <div className={cn(glassmorphism, "relative overflow-hidden")}>
          {coverImage && (
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={coverImage}
                alt={collection.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="text-xs text-white/80 font-medium">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Layers className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wider">Collection</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-lg text-foreground">{collection.title}</h3>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </motion.div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground/80">{collection.note}</p>
          </div>
        </div>
      </motion.div>

      {/* Expanded children — inline */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              className="flex flex-col gap-4 pt-4"
              variants={childContainer}
              initial="hidden"
              animate="show"
            >
              {collection.items.map((find) => (
                <motion.div key={find.id} variants={childItem}>
                  <FindCard find={find} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
