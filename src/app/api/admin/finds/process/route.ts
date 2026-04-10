import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { validateAuth, unauthorized } from "../helpers";

function isYouTubeUrl(url: string) {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url);
}

function isInstagramReelUrl(url: string) {
  return /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\//.test(url);
}

async function fetchInstagramMetadata(url: string) {
  // oEmbed for caption + author, page fetch for OG image (more reliable CDN URLs)
  const [oembedRes, pageRes] = await Promise.all([
    fetch(
      `https://i.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(10000) }
    ),
    fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FindsBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    }).catch(() => null),
  ]);

  if (!oembedRes.ok) throw new Error("Instagram oEmbed fetch failed");
  const oembed = await oembedRes.json();

  let ogImage = "";
  if (pageRes?.ok) {
    const html = await pageRes.text();
    const match =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["']/i);
    ogImage = match?.[1] || "";
  }

  return {
    title: oembed.author_name || "",
    description: oembed.title || "",
    image: ogImage || oembed.thumbnail_url || "",
    siteName: "Instagram",
    type: "reel",
    author: oembed.author_name || "",
  };
}

async function fetchYouTubeMetadata(url: string) {
  const videoId = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
  if (videoId && process.env.YOUTUBE_API_KEY) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (res.ok) {
      const data = await res.json();
      const snippet = data.items?.[0]?.snippet;
      if (snippet) {
        return {
          title: snippet.title || "",
          description: snippet.description || "",
          image: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || "",
          siteName: "YouTube",
          type: "video",
          author: snippet.channelTitle || "",
        };
      }
    }
  }

  // Fallback to oEmbed if API key is missing or request fails
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error("YouTube metadata fetch failed");
  const data = await res.json();
  return {
    title: data.title || "",
    description: "",
    image: data.thumbnail_url || "",
    siteName: "YouTube",
    type: "video",
    author: data.author_name || "",
  };
}

async function fetchPageMetadata(url: string) {
  if (isYouTubeUrl(url)) return fetchYouTubeMetadata(url);
  if (isInstagramReelUrl(url)) return fetchInstagramMetadata(url);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FindsBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();

    const getMetaContent = (name: string) => {
      const match = html.match(
        new RegExp(
          `<meta[^>]*(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']`,
          "i"
        )
      ) ||
        html.match(
          new RegExp(
            `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`,
            "i"
          )
        );
      return match?.[1] || "";
    };

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

    return {
      title: getMetaContent("og:title") || titleMatch?.[1]?.trim() || "",
      description:
        getMetaContent("og:description") || getMetaContent("description") || "",
      image: getMetaContent("og:image") || "",
      siteName: getMetaContent("og:site_name") || "",
      type: getMetaContent("og:type") || "",
      author:
        getMetaContent("author") ||
        getMetaContent("article:author") ||
        "",
    };
  } catch {
    return { title: "", description: "", image: "", siteName: "", type: "", author: "" };
  }
}

export async function POST(request: Request) {
  if (!validateAuth(request)) return unauthorized();

  try {
    const { url, notes } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const metadata = await fetchPageMetadata(url);

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const hasNotes = notes && notes.trim();

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are helping curate an "Internet Finds" collection for a personal portfolio. Given a URL and its metadata, return find entries.

URL: ${url}
Page title: ${metadata.title}
Description: ${metadata.description}
Site name: ${metadata.siteName}
Content type: ${metadata.type}
Author: ${metadata.author}
Image: ${metadata.image}${hasNotes ? `\nUser notes: ${notes}` : ""}

Each find has these fields:
- title: Clean, concise title
- type: One of "movie" | "book" | "reel" | "video" | "poetry" | "article" | "music" | "image" | "tool" | "people" | "other" — use "video" for YouTube/Vimeo full-length videos; use "reel" for Instagram reels, TikToks, and YouTube Shorts
- note: A 1-2 sentence personal note about why this is interesting. Write it casual and opinionated. Use the description for context if it's useful, otherwise infer from the title and source. Examples:
  - "John Coffey feeling all the pain in the world and still choosing to give it love."
  - "The origin of ASCII art on the internet. Glenn Chappell built it in 1991, and by the 2000s it had 400+ community-made fonts. A little piece of internet history."
  - "The docking scene still gives me chills. A film about love disguised as sci-fi."
- sourceUrl: The canonical URL for this specific find
- imageUrl: A representative image URL (use the OG image for the main URL if available, leave empty for others)
- author: The creator/author if applicable (empty string if none)
- priority: 1, 2, or 3 (1 = minor, 2 = notable, 3 = must-see)

${hasNotes ? `The user notes may mention websites, tools, or resources discussed in this content. For EACH website or tool mentioned (or that you can identify), create a SEPARATE find entry with:
- Its own title, type, note, and sourceUrl (use the actual website URL, e.g. "https://example.com")
- The first entry should be for the original URL itself
- Use your knowledge to determine the correct URLs for mentioned websites/tools

Return a JSON array of find objects.` : "Return a JSON array with a single find object."}

Return ONLY a valid JSON array, no markdown wrapping, no explanation.`,
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const text = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(text);
    const findsArray = Array.isArray(parsed) ? parsed : [parsed];

    const today = new Date().toISOString().split("T")[0];
    const finds = findsArray.map((f: Record<string, unknown>, i: number) => ({
      ...f,
      sourceUrl: i === 0 ? url : f.sourceUrl || "",
      dateAdded: today,
    }));

    return NextResponse.json({ finds });
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process URL" },
      { status: 500 }
    );
  }
}
