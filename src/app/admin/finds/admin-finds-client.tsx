"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import Image from "next/image";
import { FIND_TYPES, type Find, type FindType } from "@/content/finds";
import { cn } from "@/lib/utils";
import { FindCard } from "@/components/finds/find-card";
import {
  Film, BookOpen, Play, MonitorPlay, FileText,
  Music, ImageIcon, Sparkles, Wrench, User, SquarePen, Trash2,
} from "lucide-react";

const DRAFTS_KEY = "finds-drafts";

type DraftEntry = {
  draftId: string;
  draftSavedAt: string;
  find: Find;
};

function getDrafts(): DraftEntry[] {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDraftToStorage(find: Find, existingDraftId?: string): string {
  const drafts = getDrafts();
  const draftId = existingDraftId || `draft-${Date.now()}`;
  const entry: DraftEntry = { draftId, draftSavedAt: new Date().toISOString(), find };
  const idx = drafts.findIndex((d) => d.draftId === draftId);
  if (idx >= 0) drafts[idx] = entry;
  else drafts.unshift(entry);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return draftId;
}

function deleteDraftFromStorage(draftId: string) {
  const drafts = getDrafts().filter((d) => d.draftId !== draftId);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

// Full drop-shadow matching FeaturedSticker in pixel-stickers.tsx
const STICKER_FILTER = [
  "drop-shadow(1.25px_0_0_white)",
  "drop-shadow(-1.25px_0_0_white)",
  "drop-shadow(0_1.25px_0_white)",
  "drop-shadow(0_-1.25px_0_white)",
  "drop-shadow(1.25px_1.25px_0_white)",
  "drop-shadow(-1.25px_1.25px_0_white)",
  "drop-shadow(1.25px_-1.25px_0_white)",
  "drop-shadow(-1.25px_-1.25px_0_white)",
  "drop-shadow(0_1px_2px_rgba(0,0,0,0.15))",
].join("_");

const STICKER_OPTIONS = [
  { value: undefined, label: "None" },
  { value: "star" as const, label: "Star", src: "/svg/star.svg" },
  { value: "heart" as const, label: "Heart", src: "/svg/heart.svg" },
  { value: "thumbs-up" as const, label: "Thumbs up", src: "/svg/thumbs up.svg" },
];

const typeIcons: Record<FindType, React.ComponentType<{ className?: string }>> = {
  movie: Film, book: BookOpen, reel: Play, video: MonitorPlay,
  poetry: FileText, article: FileText, music: Music, image: ImageIcon,
  tool: Wrench, people: User, other: Sparkles,
};

const typeLabels: Record<FindType, string> = {
  movie: "Movie", book: "Book", reel: "Reel", video: "Video",
  poetry: "Poetry", article: "Article", music: "Music", image: "Image",
  tool: "Tool", people: "Person", other: "Other",
};

// Inline editable text — click to edit, blur to save
function InlineEdit({
  value,
  onChange,
  className,
  placeholder,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className={cn(
          "group/edit inline-flex items-baseline gap-1 cursor-text rounded px-1 -mx-1 hover:bg-foreground/5 transition-colors",
          !value && "text-muted-foreground/40 italic",
          className
        )}
      >
        {value || placeholder || "Click to edit"}
        <SquarePen style={{ height: 14, width: 14 }} className="shrink-0 opacity-30 group-hover/edit:opacity-60 transition-opacity" />
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
        rows={3}
        className={cn(
          "w-full rounded bg-foreground/5 px-1 -mx-1 outline-none resize-none",
          className
        )}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditing(false); }}
      className={cn(
        "w-full rounded bg-foreground/5 px-1 -mx-1 outline-none",
        className
      )}
    />
  );
}

// Sticker picker — shows current sticker or placeholder, click to cycle
function StickerPicker({
  value,
  onChange,
}: {
  value: Find["sticker"];
  onChange: (v: Find["sticker"]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-2 right-2 z-20">
      {value ? (
        <button
          onClick={() => setOpen(!open)}
          className="animate-wobble"
          style={{ "--wobble-angle": "5deg" } as React.CSSProperties}
        >
          <Image
            src={STICKER_OPTIONS.find((o) => o.value === value)!.src!}
            alt={value}
            width={28}
            height={28}
            className={`pointer-events-none [filter:${STICKER_FILTER}]`}
          />
        </button>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground/30 hover:border-muted-foreground/60 hover:text-muted-foreground/60 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      )}
      {open && (
        <div className="absolute top-9 right-0 flex gap-1 rounded-lg border border-border bg-background p-1.5 shadow-lg">
          {STICKER_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/5 transition-colors",
                value === opt.value && "bg-foreground/10"
              )}
            >
              {opt.src ? (
                <Image src={opt.src} alt={opt.label} width={20} height={20} />
              ) : (
                <span className="text-xs text-muted-foreground">X</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// The edit card — matches find-card.tsx visuals exactly, with inline editing + featured effects
function PreviewCard({
  find,
  onUpdate,
}: {
  find: Find;
  onUpdate: (field: keyof Find, value: unknown) => void;
}) {
  const Icon = typeIcons[find.type];
  const hasImage = find.type === "movie" || find.type === "reel" || find.type === "video" ||
    find.type === "article" || find.type === "image" || find.type === "tool" || find.type === "people";
  const showAuthor = find.type === "book" || find.type === "video" || find.type === "article" ||
    find.type === "music";
  const cardContent = (
    <>
      <StickerPicker
        value={find.sticker}
        onChange={(v) => onUpdate("sticker", v)}
      />

      {/* Image section */}
      {hasImage && find.imageUrl && (
        <div className={cn(
          "relative w-full overflow-hidden",
          find.type === "movie" ? "aspect-[2/3]" : "aspect-video"
        )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={find.imageUrl}
            alt={find.title}
            className="h-full w-full object-cover"
          />
          {(find.type === "reel" || find.type === "video") && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black">
                <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
          {find.type === "image" && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
              <InlineEdit
                value={find.title}
                onChange={(v) => onUpdate("title", v)}
                className="font-semibold text-white"
                placeholder="Title"
              />
              <InlineEdit
                value={find.note}
                onChange={(v) => onUpdate("note", v)}
                className="mt-1 text-sm text-white/80"
                placeholder="Add a note..."
                multiline
              />
            </div>
          )}
        </div>
      )}

      {/* Text section (not for image type which shows text in overlay) */}
      {find.type !== "image" && (
        <div className="p-4">
          {/* Type badge row */}
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Icon className="h-3.5 w-3.5" />
            <select
              value={find.type}
              onChange={(e) => onUpdate("type", e.target.value)}
              className="text-xs uppercase tracking-wider bg-transparent outline-none cursor-pointer hover:text-foreground transition-colors"
            >
              {FIND_TYPES.map((t) => (
                <option key={t} value={t}>{typeLabels[t]}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <InlineEdit
            value={find.title}
            onChange={(v) => onUpdate("title", v)}
            className="font-semibold text-foreground text-base"
            placeholder="Title"
          />

          {/* Author (conditional) */}
          {showAuthor && (
            <div className="mt-0.5">
              <span className="text-sm text-muted-foreground">by </span>
              <InlineEdit
                value={find.author || ""}
                onChange={(v) => onUpdate("author", v)}
                className="text-sm text-muted-foreground"
                placeholder="Author"
              />
            </div>
          )}

          {/* Note */}
          <div className="mt-2">
            <InlineEdit
              value={find.note}
              onChange={(v) => onUpdate("note", v)}
              className="text-sm text-muted-foreground/80"
              placeholder="Add a note..."
              multiline
            />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      className={cn(
        "relative rounded-2xl backdrop-blur-xl overflow-hidden",
        "bg-gradient-to-br from-white/60 via-white/40 to-white/20 dark:from-white/[0.08] dark:via-white/[0.04] dark:to-white/[0.01]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.02)]",
        "border border-white/40 dark:border-white/[0.08]",
      )}
    >
      {cardContent}
    </div>
  );
}

// Read-only preview using the real FindCard component — fully interactive for hover effects
function FindCardPreview({ find }: { find: Find }) {
  return <FindCard find={find} />;
}

function AdminFindsInner() {
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [find, setFind] = useState<Find | null>(null);
  const [step, setStep] = useState<"url" | "edit" | "preview">("url");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  useEffect(() => {
    const shared = searchParams.get("url") || searchParams.get("text") || "";
    if (shared) {
      const urlMatch = shared.match(/https?:\/\/[^\s]+/);
      setUrl(urlMatch ? urlMatch[0] : shared);
    }
  }, [searchParams]);

  useEffect(() => {
    const saved = sessionStorage.getItem("finds-token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    setDrafts(getDrafts());
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  function handleLogin() {
    sessionStorage.setItem("finds-token", password);
    setToken(password);
  }

  async function processUrl() {
    if (!url.trim()) return;
    setLoading(true);
    setStatus(null);
    setFind(null);

    try {
      const res = await fetch("/api/admin/finds/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process");

      const f = data.find;
      const findObj: Find = {
        id: `find-${Date.now()}`,
        title: f.title || "",
        type: f.type || "other",
        note: f.note || "",
        sourceUrl: f.sourceUrl || url.trim(),
        imageUrl: f.imageUrl || "",
        author: f.author || "",
        priority: f.priority || 1,
        dateAdded: f.dateAdded || new Date().toISOString().split("T")[0],
        featured: false,
        sticker: undefined,
      };
      setFind(findObj);
      setStep("edit");
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to process URL" });
    } finally {
      setLoading(false);
    }
  }

  async function commitFind() {
    if (!find) return;
    setCommitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/finds/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ find }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to commit");
      if (currentDraftId) {
        deleteDraftFromStorage(currentDraftId);
        setDrafts(getDrafts());
        setCurrentDraftId(null);
      }
      setStatus({ type: "success", message: `Saved! (ID: ${data.id}) Site will rebuild shortly.` });
      setFind(null);
      setUrl("");
      setStep("url");
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setCommitting(false);
    }
  }

  function updateFind(field: keyof Find, value: unknown) {
    if (!find) return;
    setFind({ ...find, [field]: value });
  }

  function saveDraft() {
    if (!find) return;
    const draftId = saveDraftToStorage(find, currentDraftId ?? undefined);
    setCurrentDraftId(draftId);
    setDrafts(getDrafts());
    setStatus({ type: "success", message: "Saved to drafts." });
  }

  function loadDraft(entry: DraftEntry) {
    setFind(entry.find);
    setCurrentDraftId(entry.draftId);
    setStatus(null);
    setStep("edit");
  }

  function deleteDraft(draftId: string) {
    deleteDraftFromStorage(draftId);
    setDrafts(getDrafts());
    if (currentDraftId === draftId) setCurrentDraftId(null);
  }

  // Auth gate
  if (!token) {
    return (
      <div
        style={{ minHeight: "calc(100dvh - 5.5rem)" }}
        className="flex items-center justify-center p-4"
      >
        <div className="flex w-full max-w-sm flex-col gap-4">
          <h1 className="text-xl font-semibold">Finds Admin</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground/20"
            autoFocus
          />
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-foreground px-4 py-3 text-base font-medium text-background"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Step 1: URL input
  if (step === "url") {
    return (
      <div
        style={{ minHeight: "calc(100dvh - 5.5rem)" }}
        className="flex items-center justify-center p-4"
      >
        <div className="flex w-full max-w-sm flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Add Find</h1>
            <button
              onClick={() => {
                sessionStorage.removeItem("finds-token");
                setToken(null);
              }}
              className="text-sm text-muted-foreground"
            >
              Logout
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="url"
              placeholder="Paste a URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && processUrl()}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground/20"
              autoFocus
            />
            <button
              onClick={processUrl}
              disabled={loading || !url.trim()}
              className="w-full rounded-lg bg-foreground px-4 py-3 text-base font-medium text-background disabled:opacity-50"
            >
              {loading ? "Processing..." : "Process URL"}
            </button>
          </div>

          {status && (
            <div
              className={cn(
                "rounded-lg px-4 py-3 text-sm",
                status.type === "success"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {status.message}
            </div>
          )}

          {drafts.length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Drafts</span>
              {drafts.map((entry) => (
                <div
                  key={entry.draftId}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                >
                  <button
                    onClick={() => loadDraft(entry)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-sm font-medium truncate">{entry.find.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{entry.find.type} · {new Date(entry.draftSavedAt).toLocaleDateString()}</p>
                  </button>
                  <button
                    onClick={() => deleteDraft(entry.draftId)}
                    className="shrink-0 text-muted-foreground/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Edit card
  if (step === "edit" && find) {
    return (
      <div
        style={{ minHeight: "calc(100dvh - 5.5rem)" }}
        className="flex items-center justify-center p-4"
      >
        <div className="flex w-full flex-col gap-4" style={{ maxWidth: 288 }}>
          <h1 className="text-xl font-bold">Edit Card</h1>
          <PreviewCard find={find} onUpdate={updateFind} />

          {/* Controls below card */}
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Image URL</span>
              <input
                value={find.imageUrl || ""}
                onChange={(e) => updateFind("imageUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </label>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Priority</span>
              <div className="flex gap-1">
                {([1, 2, 3] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateFind("priority", p)}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                      find.priority === p
                        ? "bg-foreground text-background"
                        : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={find.featured || false}
                onChange={(e) => updateFind("featured", e.target.checked)}
                className="rounded"
              />
              <span className="text-xs text-muted-foreground">Featured</span>
            </label>
          </div>

          {status && (
            <div className={cn("rounded-lg px-4 py-3 text-sm", status.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
              {status.message}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setStep("url")}
              className="rounded-lg border border-border px-3 py-2 text-base font-medium text-foreground"
            >
              Back
            </button>
            <button
              onClick={saveDraft}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-base font-medium text-foreground"
            >
              Save Draft
            </button>
            <button
              onClick={() => setStep("preview")}
              className="rounded-lg bg-foreground px-3 py-2 text-base font-medium text-background"
            >
              Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Final preview
  if (step === "preview" && find) {
    return (
      <div
        style={{ minHeight: "calc(100dvh - 5.5rem)" }}
        className="flex items-center justify-center p-4 flex-col gap-4"
      >
        <div className="flex w-full flex-col gap-4" style={{ maxWidth: 288 }}>
        <h1 className="text-xl font-bold">Preview</h1>

          {/* Read-only card using the real FindCard */}
          <FindCardPreview find={find} />

          {status && (
            <div
              className={cn(
                "rounded-lg px-4 py-3 text-sm",
                status.type === "success"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {status.message}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("edit")}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-base font-medium text-foreground"
            >
              Back
            </button>
            <button
              onClick={commitFind}
              disabled={committing}
              className="flex-1 rounded-lg bg-foreground px-3 py-2 text-base font-medium text-background"
            >
              {committing ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't happen)
  return null;
}

export function AdminFindsClient() {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <AdminFindsInner />
      </Suspense>
    </div>
  );
}
