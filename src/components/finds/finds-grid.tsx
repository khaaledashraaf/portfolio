"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Find, FindType, FindItem } from "@/content/finds";
import { FindCard } from "./find-card";
import { CollectionCard } from "./collection-card";
import { FindDetailOverlay } from "./find-detail";
import { Badge } from "@/components/ui/badge";
import {
  LayoutGrid,
  List,
  Film,
  BookOpen,
  Play,
  MonitorPlay,
  FileText,
  Music,
  ImageIcon,
  Sparkles,
  Wrench,
  PenLine,
  User,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const typeLabels: Record<FindType, string> = {
  movie: "Movies",
  book: "Books",
  reel: "Reels",
  video: "Videos",
  poetry: "Poetry",
  article: "Articles",
  music: "Music",
  image: "Images",
  tool: "Tools",
  people: "People",
  other: "Other",
};

const typeIcons: Record<FindType, React.FC<{ className?: string }>> = {
  movie: Film,
  book: BookOpen,
  reel: Play,
  video: MonitorPlay,
  poetry: PenLine,
  article: FileText,
  music: Music,
  image: ImageIcon,
  tool: Wrench,
  people: User,
  other: Sparkles,
};

function isCollection(item: FindItem): item is FindItem & { kind: "collection" } {
  return item.kind === "collection";
}

interface FindsGridProps {
  items: FindItem[];
  types: FindType[];
}

type ViewMode = "grid" | "list";

function FindListItem({ find }: { find: Find }) {
  const Comp = find.sourceUrl ? "a" : "div";
  const Icon = typeIcons[find.type];
  return (
    <Comp
      {...(find.sourceUrl
        ? { href: find.sourceUrl, target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group flex items-start gap-4 py-3 border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg"
    >
      <Icon className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h3 className="font-semibold text-foreground group-hover:underline truncate">
            {find.title}
          </h3>
          {find.author && (
            <span className="text-sm text-muted-foreground shrink-0">
              by {find.author}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{find.note}</p>
      </div>
      <span className="text-xs text-muted-foreground/60 shrink-0 mt-1">
        {typeLabels[find.type].replace(/s$/, "")}
      </span>
    </Comp>
  );
}

function CollectionListItem({
  collection,
  isExpanded,
  onToggle,
}: {
  collection: FindItem & { kind: "collection" };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="group flex items-start gap-4 py-3 border-b border-border/40 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg w-full text-left"
      >
        <Layers className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:underline truncate">
            {collection.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{collection.note}</p>
        </div>
        <div className="text-xs text-muted-foreground/60 shrink-0 mt-1 text-right">
          <div>Collection</div>
          <div>{collection.items.length} items</div>
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-8">
              {collection.items.map((find) => (
                <FindListItem key={find.id} find={find} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FindsGrid({ items, types }: FindsGridProps) {
  const [activeType, setActiveType] = useState<FindType | null>(null);
  const [view, setView] = useState<ViewMode>("grid");
  const [selectedFind, setSelectedFind] = useState<Find | null>(null);
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);
  const [closing, setClosing] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const [colCount, setColCount] = useState(3);

  useEffect(() => {
    function updateCols() {
      if (window.innerWidth >= 1024) setColCount(3);
      else if (window.innerWidth >= 640) setColCount(2);
      else setColCount(1);
    }
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const toggleCollection = useCallback((id: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    if (!activeType) return items;
    return items.filter((f) => {
      if (isCollection(f)) return f.items.some((child) => child.type === activeType);
      return f.type === activeType;
    });
  }, [items, activeType]);

  const effectiveCols = useMemo(() => {
    return Math.min(colCount, filtered.length);
  }, [colCount, filtered.length]);

  const columns = useMemo(() => {
    const cols: FindItem[][] = Array.from({ length: effectiveCols }, () => []);
    filtered.forEach((findItem, i) => {
      cols[i % effectiveCols].push(findItem);
    });
    return cols;
  }, [filtered, effectiveCols]);

  const placeholderCount = useMemo(() => {
    if (colCount <= 1) return 0;
    return colCount - effectiveCols;
  }, [colCount, effectiveCols]);

  // Collect all plain finds for the detail overlay's "related" section
  const allFinds = useMemo(() => {
    const result: Find[] = [];
    items.forEach((f) => {
      if (isCollection(f)) result.push(...f.items);
      else result.push(f);
    });
    return result;
  }, [items]);

  function renderGridItem(findItem: FindItem) {
    if (isCollection(findItem)) {
      return (
        <CollectionCard
          collection={findItem}
          isExpanded={expandedCollections.has(findItem.id)}
          onToggle={() => toggleCollection(findItem.id)}
        />
      );
    }
    return (
      <FindCard
        find={findItem}
        isSelected={selectedFind?.id === findItem.id}
        onInspect={findItem.expandable ? (rect: DOMRect) => { setSelectedRect(rect); setSelectedFind(findItem); } : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex flex-wrap gap-2 flex-1">
          <button onClick={() => setActiveType(null)}>
            <Badge variant={activeType === null ? "default" : "outline"}>
              All
            </Badge>
          </button>
          {types.map((type) => (
            <button key={type} onClick={() => setActiveType(type)}>
              <Badge variant={activeType === type ? "default" : "outline"}>
                {typeLabels[type]}
              </Badge>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 border border-border/50 rounded-lg p-0.5 bg-white dark:bg-black">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              view === "grid"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              view === "list"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {view === "grid" ? (
        colCount === 1 ? (
          <motion.div
            key={`grid-${activeType ?? "all"}-single`}
            className="flex flex-col gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filtered.map((findItem) => (
              <motion.div key={findItem.id} variants={item}>
                {renderGridItem(findItem)}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${activeType ?? "all"}-${colCount}`}
            className="flex gap-4 w-full"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {columns.map((col, colIndex) => (
              <div key={colIndex} className="flex-1 min-w-0 flex flex-col gap-4">
                {col.map((findItem) => (
                  <motion.div key={findItem.id} variants={item}>
                    {renderGridItem(findItem)}
                  </motion.div>
                ))}
              </div>
            ))}
            {Array.from({ length: placeholderCount }).map((_, i) => (
              <div key={`placeholder-${i}`} className="flex-1 min-w-0 flex flex-col gap-4">
                <motion.div variants={item}>
                  <div className="rounded-xl border border-dashed border-border/40 bg-muted/20 aspect-[4/3]" />
                </motion.div>
              </div>
            ))}
          </motion.div>
        )
      ) : (
        <motion.div
          key={`list-${activeType ?? "all"}`}
          className="flex flex-col"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filtered.map((findItem) => (
            <motion.div key={findItem.id} variants={item}>
              {isCollection(findItem) ? (
                <CollectionListItem
                  collection={findItem}
                  isExpanded={expandedCollections.has(findItem.id)}
                  onToggle={() => toggleCollection(findItem.id)}
                />
              ) : (
                <FindListItem find={findItem} />
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {filtered.length === 0 && (
        <p className="text-muted-foreground">No finds yet in this category.</p>
      )}

      <AnimatePresence
        onExitComplete={() => {
          setSelectedFind(null);
          setSelectedRect(null);
          setClosing(false);
        }}
      >
        {selectedFind && !closing && (
          <FindDetailOverlay
            find={selectedFind}
            allFinds={allFinds}
            originRect={selectedRect}
            onClose={() => setClosing(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
