"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, Suspense, useRef } from "react";
import Image from "next/image";
import { FIND_TYPES, type Find, type FindType } from "@/content/finds";
import { cn } from "@/lib/utils";
import { FindCard } from "@/components/finds/find-card";
import {
  Film, BookOpen, Play, MonitorPlay, FileText,
  Music, ImageIcon, Sparkles, Wrench, User, SquarePen, Trash2, Plus,
} from "lucide-react";

type DraftEntry = { draftId: string; draftSavedAt: string; find: Find; finds?: Find[] };
type Step = "dashboard" | "add-url" | "edit" | "preview";
type DashTab = "published" | "drafts";

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
  value, onChange, className, placeholder, multiline,
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
    if (editing && ref.current) { ref.current.focus(); ref.current.select(); }
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
        className={cn("w-full rounded bg-foreground/5 px-1 -mx-1 outline-none resize-none", className)}
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
      className={cn("w-full rounded bg-foreground/5 px-1 -mx-1 outline-none", className)}
    />
  );
}

// Sticker picker — shows current sticker or placeholder, click to cycle
function StickerPicker({ value, onChange }: { value: Find["sticker"]; onChange: (v: Find["sticker"]) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-2 right-2 z-20">
      {value ? (
        <button onClick={() => setOpen(!open)} className="animate-wobble" style={{ "--wobble-angle": "5deg" } as React.CSSProperties}>
          <Image
            src={STICKER_OPTIONS.find((o) => o.value === value)!.src!}
            alt={value} width={28} height={28}
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
              className={cn("flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/5 transition-colors", value === opt.value && "bg-foreground/10")}
            >
              {opt.src ? <Image src={opt.src} alt={opt.label} width={20} height={20} /> : <span className="text-xs text-muted-foreground">X</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// The edit card — matches find-card.tsx visuals exactly, with inline editing
function PreviewCard({ find, onUpdate }: { find: Find; onUpdate: (field: keyof Find, value: unknown) => void }) {
  const Icon = typeIcons[find.type];
  const hasImage = find.type === "movie" || find.type === "reel" || find.type === "video" ||
    find.type === "article" || find.type === "image" || find.type === "tool" || find.type === "people";
  const showAuthor = find.type === "book" || find.type === "video" || find.type === "article" || find.type === "music";

  const cardContent = (
    <>
      <StickerPicker value={find.sticker} onChange={(v) => onUpdate("sticker", v)} />

      {hasImage && find.imageUrl && (
        <div className={cn("relative w-full overflow-hidden", find.type === "movie" ? "aspect-[2/3]" : "aspect-video")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={find.imageUrl} alt={find.title} className="h-full w-full object-cover" />
          {(find.type === "reel" || find.type === "video") && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black">
                <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
          {find.type === "image" && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
              <InlineEdit value={find.title} onChange={(v) => onUpdate("title", v)} className="font-semibold text-white" placeholder="Title" />
              <InlineEdit value={find.note} onChange={(v) => onUpdate("note", v)} className="mt-1 text-sm text-white/80" placeholder="Add a note..." multiline />
            </div>
          )}
        </div>
      )}

      {find.type !== "image" && (
        <div className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Icon className="h-3.5 w-3.5" />
            <select
              value={find.type}
              onChange={(e) => onUpdate("type", e.target.value)}
              className="text-xs uppercase tracking-wider bg-transparent outline-none cursor-pointer hover:text-foreground transition-colors"
            >
              {FIND_TYPES.map((t) => <option key={t} value={t}>{typeLabels[t]}</option>)}
            </select>
          </div>
          <InlineEdit value={find.title} onChange={(v) => onUpdate("title", v)} className="font-semibold text-foreground text-base" placeholder="Title" />
          {showAuthor && (
            <div className="mt-0.5">
              <span className="text-sm text-muted-foreground">by </span>
              <InlineEdit value={find.author || ""} onChange={(v) => onUpdate("author", v)} className="text-sm text-muted-foreground" placeholder="Author" />
            </div>
          )}
          <div className="mt-2">
            <InlineEdit value={find.note} onChange={(v) => onUpdate("note", v)} className="text-sm text-muted-foreground/80" placeholder="Add a note..." multiline />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className={cn(
      "relative rounded-2xl backdrop-blur-xl overflow-hidden",
      "bg-gradient-to-br from-white/60 via-white/40 to-white/20 dark:from-white/[0.08] dark:via-white/[0.04] dark:to-white/[0.01]",
      "shadow-[0_8px_32px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.02)]",
      "border border-white/40 dark:border-white/[0.08]",
    )}>
      {cardContent}
    </div>
  );
}

function AdminFindsInner() {
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // Dashboard state
  const [step, setStep] = useState<Step>("dashboard");
  const [dashTab, setDashTab] = useState<DashTab>("published");
  const [publishedFinds, setPublishedFinds] = useState<Find[]>([]);
  const [loadingFinds, setLoadingFinds] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add/edit flow state
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [finds, setFinds] = useState<Find[]>([]);
  const [isExistingFind, setIsExistingFind] = useState(false);
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
    const saved = localStorage.getItem("finds-token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadDrafts();
    loadPublishedFinds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
  }, []);

  useEffect(() => { setConfirmDeleteId(null); }, [dashTab]);

  async function loadPublishedFinds() {
    setLoadingFinds(true);
    try {
      const res = await fetch("/api/admin/finds/list", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.finds) setPublishedFinds(data.finds);
    } catch { /* silently fail */ } finally {
      setLoadingFinds(false);
    }
  }

  async function loadDrafts() {
    try {
      const res = await fetch("/api/admin/finds/drafts", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.drafts) setDrafts(data.drafts);
    } catch { /* silently fail */ }
  }

  function handleLogin() {
    localStorage.setItem("finds-token", password);
    setToken(password);
  }

  function handleLogout() {
    localStorage.removeItem("finds-token");
    setToken(null);
  }

  function editExistingFind(f: Find) {
    setFinds([f]);
    setIsExistingFind(true);
    setCurrentDraftId(null);
    setStatus(null);
    setStep("edit");
  }

  async function processUrl() {
    if (!url.trim()) return;
    setLoading(true);
    setStatus(null);
    setFinds([]);

    try {
      const res = await fetch("/api/admin/finds/process", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: url.trim(), notes: notes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process");

      const findsArray = (data.finds || [data.find]).map((f: Record<string, unknown>, i: number) => ({
        id: `find-${Date.now()}-${i}`,
        title: (f.title as string) || "",
        type: (f.type as FindType) || "other",
        note: (f.note as string) || "",
        sourceUrl: (f.sourceUrl as string) || (i === 0 ? url.trim() : ""),
        imageUrl: (f.imageUrl as string) || "",
        author: (f.author as string) || "",
        priority: (f.priority as number) || 1,
        dateAdded: (f.dateAdded as string) || new Date().toISOString().split("T")[0],
        featured: false,
        sticker: undefined,
      }));
      setFinds(findsArray);
      setIsExistingFind(false);
      setStep("edit");
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to process URL" });
    } finally {
      setLoading(false);
    }
  }

  async function commitFinds() {
    if (finds.length === 0) return;
    setCommitting(true);
    setStatus(null);

    try {
      for (const f of finds) {
        const res = await fetch("/api/admin/finds/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ find: f }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to commit "${f.title}"`);
      }

      if (currentDraftId) {
        await fetch("/api/admin/finds/drafts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ draftId: currentDraftId }),
        });
        setDrafts((prev) => prev.filter((d) => d.draftId !== currentDraftId));
        setCurrentDraftId(null);
      }

      setFinds([]);
      setUrl("");
      setNotes("");
      setStep("dashboard");
      setDashTab("published");
      loadPublishedFinds();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setCommitting(false);
    }
  }

  async function updateExistingFind() {
    if (finds.length === 0) return;
    setCommitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/finds/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ find: finds[0] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setFinds([]);
      setIsExistingFind(false);
      setStep("dashboard");
      loadPublishedFinds();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to update" });
    } finally {
      setCommitting(false);
    }
  }

  async function deletePublishedFind(id: string) {
    try {
      await fetch("/api/admin/finds/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      setPublishedFinds((prev) => prev.filter((f) => f.id !== id));
      setConfirmDeleteId(null);
    } catch { /* silently fail */ }
  }

  function updateFindField(index: number, field: keyof Find, value: unknown) {
    setFinds((prev) => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  }

  function removeFind(index: number) {
    setFinds((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveDraft() {
    if (finds.length === 0) return;
    setStatus(null);
    try {
      const res = await fetch("/api/admin/finds/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ find: finds[0], finds, draftId: currentDraftId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");
      setCurrentDraftId(data.draftId);
      loadDrafts();
      setStatus({ type: "success", message: "Saved to drafts." });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to save draft" });
    }
  }

  function loadDraft(entry: DraftEntry) {
    // Support both old single-find drafts and new batch drafts
    setFinds(entry.finds && entry.finds.length > 0 ? entry.finds : [entry.find]);
    setCurrentDraftId(entry.draftId);
    setIsExistingFind(false);
    setStatus(null);
    setStep("edit");
  }

  async function deleteDraft(draftId: string) {
    try {
      await fetch("/api/admin/finds/drafts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ draftId }),
      });
      setDrafts((prev) => prev.filter((d) => d.draftId !== draftId));
      if (currentDraftId === draftId) setCurrentDraftId(null);
    } catch { /* silently fail */ }
  }

  const filteredFinds = useMemo(() =>
    searchQuery.trim()
      ? publishedFinds.filter((f) => f.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : publishedFinds,
    [publishedFinds, searchQuery]
  );

  // --- Auth gate ---
  if (!token) {
    return (
      <div style={{ minHeight: "calc(100dvh - 5.5rem)" }} className="flex items-center justify-center p-4">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <h1 className="text-xl font-semibold">Finds Admin</h1>
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground/20"
            autoFocus
          />
          <button onClick={handleLogin} className="w-full rounded-lg bg-foreground px-4 py-3 text-base font-medium text-background">
            Login
          </button>
        </div>
      </div>
    );
  }

  // --- Dashboard ---
  if (step === "dashboard") {
    return (
      <div className="flex flex-col" style={{ minHeight: "calc(100dvh - 5.5rem)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background/90 backdrop-blur-md z-10">
          <h1 className="text-base font-semibold">Finds</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsExistingFind(false); setFinds([]); setUrl(""); setNotes(""); setCurrentDraftId(null); setStatus(null); setStep("add-url"); }}
              className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["published", "drafts"] as DashTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setDashTab(tab)}
              className={cn(
                "flex-1 py-2.5 text-sm transition-colors",
                dashTab === tab
                  ? "font-medium text-foreground border-b-2 border-foreground -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "published"
                ? `Published${publishedFinds.length ? ` (${publishedFinds.length})` : ""}`
                : `Drafts${drafts.length ? ` (${drafts.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* Published tab */}
        {dashTab === "published" && (
          <>
            <div className="px-4 py-2.5 border-b border-border/50">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search finds..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            {loadingFinds ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : filteredFinds.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">{searchQuery ? "No results." : "No finds yet."}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredFinds.map((f) => {
                  const FIcon = typeIcons[f.type] ?? Sparkles;
                  return (
                    <div key={f.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <FIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{typeLabels[f.type] ?? f.type}</span>
                          {f.featured && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 py-px rounded">featured</span>
                          )}
                          {(f.priority ?? 1) > 1 && (
                            <span className="text-[10px] text-muted-foreground/60 px-1 py-px rounded bg-foreground/5">p{f.priority}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate leading-snug">{f.title}</p>
                        <p className="text-xs text-muted-foreground/50 mt-0.5">{f.dateAdded}</p>
                      </div>
                      <div className="flex shrink-0">
                        <button
                          onClick={() => editExistingFind(f)}
                          className="p-2 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                        >
                          <SquarePen className="h-3.5 w-3.5" />
                        </button>
                        {confirmDeleteId === f.id ? (
                          <button
                            onClick={() => deletePublishedFind(f.id)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-red-500 bg-red-500/10"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(f.id)}
                            className="p-2 rounded-md text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Drafts tab */}
        {dashTab === "drafts" && (
          drafts.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No drafts.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {drafts.map((entry) => {
                const FIcon = typeIcons[entry.find.type] ?? Sparkles;
                return (
                  <div key={entry.draftId} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <FIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{typeLabels[entry.find.type] ?? entry.find.type}</span>
                      </div>
                      <p className="text-sm font-medium truncate">{entry.find.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground/50 mt-0.5">{new Date(entry.draftSavedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex shrink-0">
                      <button
                        onClick={() => loadDraft(entry)}
                        className="p-2 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                      >
                        <SquarePen className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteDraft(entry.draftId)}
                        className="p-2 rounded-md text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    );
  }

  // --- Add URL step ---
  if (step === "add-url") {
    return (
      <div style={{ minHeight: "calc(100dvh - 5.5rem)" }} className="flex items-center justify-center p-4">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Add Find</h1>
            <button onClick={() => setStep("dashboard")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="url" placeholder="Paste a URL..." value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && processUrl()}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-foreground/20"
              autoFocus
            />
            <textarea
              placeholder="Notes (optional) — describe what the video covers, mention websites or tools..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
            />
            <button
              onClick={processUrl} disabled={loading || !url.trim()}
              className="w-full rounded-lg bg-foreground px-4 py-3 text-base font-medium text-background disabled:opacity-50"
            >
              {loading ? "Processing..." : "Process URL"}
            </button>
          </div>
          {status && (
            <div className={cn("rounded-lg px-4 py-3 text-sm", status.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
              {status.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Edit step ---
  if (step === "edit" && finds.length > 0) {
    return (
      <div style={{ minHeight: "calc(100dvh - 5.5rem)" }} className="flex items-center justify-center p-4">
        <div className="flex w-full flex-col gap-4" style={{ maxWidth: 288 }}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              {isExistingFind ? "Edit Find" : `Edit ${finds.length > 1 ? `${finds.length} Cards` : "Card"}`}
            </h1>
            {isExistingFind && <span className="text-xs text-muted-foreground">#{finds[0].id}</span>}
          </div>

          <div className="flex flex-col gap-6">
            {finds.map((f, index) => (
              <div key={f.id} className="flex flex-col gap-3">
                {finds.length > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {index + 1} of {finds.length}
                    </span>
                    <button
                      onClick={() => removeFind(index)}
                      className="flex items-center gap-1 text-xs text-red-500/60 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                )}

                <PreviewCard find={f} onUpdate={(field, value) => updateFindField(index, field, value)} />

                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Image URL</span>
                  <input
                    value={f.imageUrl || ""}
                    onChange={(e) => updateFindField(index, "imageUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/20"
                  />
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Priority</span>
                  <div className="flex gap-1">
                    {([1, 2, 3] as const).map((p) => (
                      <button
                        key={p} onClick={() => updateFindField(index, "priority", p)}
                        className={cn(
                          "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                          f.priority === p ? "bg-foreground text-background" : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" checked={f.featured || false}
                    onChange={(e) => updateFindField(index, "featured", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs text-muted-foreground">Featured</span>
                </label>

                {index < finds.length - 1 && (
                  <div className="border-t border-border/50 mt-2" />
                )}
              </div>
            ))}
          </div>

          {status && (
            <div className={cn("rounded-lg px-4 py-3 text-sm", status.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
              {status.message}
            </div>
          )}

          <div className="flex gap-3 mt-3">
            <button onClick={() => setStep("dashboard")} className="rounded-lg border border-border px-3 py-2 text-base font-medium text-foreground">
              Back
            </button>
            {!isExistingFind && (
              <button onClick={saveDraft} className="flex-1 rounded-lg border border-border px-3 py-2 text-base font-medium text-foreground">
                Draft
              </button>
            )}
            <button onClick={() => setStep("preview")} className="rounded-lg bg-foreground px-3 py-2 text-base font-medium text-background">
              Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Preview step ---
  if (step === "preview" && finds.length > 0) {
    return (
      <div style={{ minHeight: "calc(100dvh - 5.5rem)" }} className="flex items-center justify-center p-4 flex-col gap-4">
        <div className="flex w-full flex-col gap-4" style={{ maxWidth: 288 }}>
          <h1 className="text-xl font-bold">
            {finds.length > 1 ? `Preview (${finds.length})` : "Preview"}
          </h1>
          <div className="flex flex-col gap-4">
            {finds.map((f) => (
              <FindCard key={f.id} find={f} />
            ))}
          </div>
          {status && (
            <div className={cn("rounded-lg px-4 py-3 text-sm", status.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
              {status.message}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep("edit")} className="flex-1 rounded-lg border border-border px-3 py-2 text-base font-medium text-foreground">
              Back
            </button>
            <button
              onClick={isExistingFind ? updateExistingFind : commitFinds}
              disabled={committing}
              className="flex-1 rounded-lg bg-foreground px-3 py-2 text-base font-medium text-background disabled:opacity-50"
            >
              {committing ? "Saving..." : isExistingFind ? "Update" : `Publish${finds.length > 1 ? ` (${finds.length})` : ""}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function AdminFindsClient() {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="flex flex-1 items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
        <AdminFindsInner />
      </Suspense>
    </div>
  );
}
