"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

const FIND_TYPES = [
  "movie", "book", "reel", "video", "poetry",
  "article", "music", "image", "tool", "people", "other",
] as const;

interface FindData {
  title: string;
  type: string;
  note: string;
  sourceUrl: string;
  imageUrl: string;
  author: string;
  priority: number;
  dateAdded: string;
}

function AdminFindsInner() {
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [find, setFind] = useState<FindData | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Pick up shared URL from query params
  useEffect(() => {
    const shared = searchParams.get("url") || searchParams.get("text") || "";
    if (shared) {
      // Extract URL from text if it contains one
      const urlMatch = shared.match(/https?:\/\/[^\s]+/);
      setUrl(urlMatch ? urlMatch[0] : shared);
    }
  }, [searchParams]);

  // Restore session
  useEffect(() => {
    const saved = sessionStorage.getItem("finds-token");
    if (saved) setToken(saved);
  }, []);

  // Register service worker
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
      setFind(data.find);
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
      setStatus({ type: "success", message: `Saved! (ID: ${data.id}) Site will rebuild shortly.` });
      setFind(null);
      setUrl("");
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setCommitting(false);
    }
  }

  function updateFind(field: keyof FindData, value: string | number) {
    if (!find) return;
    setFind({ ...find, [field]: value });
  }

  // Auth gate
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
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

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pb-20">
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

      {/* URL Input */}
      <div className="space-y-3">
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

      {/* Status */}
      {status && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            status.type === "success"
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Preview / Edit */}
      {find && (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <h2 className="text-sm font-medium text-muted-foreground">Preview</h2>

          {find.imageUrl && (
            <img
              src={find.imageUrl}
              alt=""
              className="h-40 w-full rounded-md object-cover"
            />
          )}

          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">Title</span>
            <input
              value={find.title}
              onChange={(e) => updateFind("title", e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">Type</span>
            <select
              value={find.type}
              onChange={(e) => updateFind("type", e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/20"
            >
              {FIND_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">Note</span>
            <textarea
              value={find.note}
              onChange={(e) => updateFind("note", e.target.value)}
              rows={3}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">Author</span>
            <input
              value={find.author}
              onChange={(e) => updateFind("author", e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">Image URL</span>
            <input
              value={find.imageUrl}
              onChange={(e) => updateFind("imageUrl", e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">Priority</span>
            <select
              value={find.priority}
              onChange={(e) => updateFind("priority", Number(e.target.value))}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/20"
            >
              <option value={1}>1 - Minor</option>
              <option value={2}>2 - Notable</option>
              <option value={3}>3 - Must-see</option>
            </select>
          </label>

          <button
            onClick={commitFind}
            disabled={committing}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
          >
            {committing ? "Saving..." : "Save to GitHub"}
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminFindsClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <AdminFindsInner />
    </Suspense>
  );
}
