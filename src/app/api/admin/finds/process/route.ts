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
    const formData = await request.formData();
    const url = (formData.get("url") as string)?.trim() || "";
    const notes = (formData.get("notes") as string)?.trim() || "";
    const imageFiles = formData.getAll("images") as File[];

    if (!url && imageFiles.length === 0) {
      return NextResponse.json({ error: "URL or images required" }, { status: 400 });
    }

    // Fetch metadata if URL provided
    const metadata = url ? await fetchPageMetadata(url) : null;

    // Build Claude message content blocks
    const contentBlocks: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

    // Add images first (Claude processes them better before text)
    for (const file of imageFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      contentBlocks.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: buffer.toString("base64") },
      });
    }

    // Build text prompt
    let context = "";
    if (url && metadata) {
      context += `URL: ${url}\nPage title: ${metadata.title}\nDescription: ${metadata.description}\nSite name: ${metadata.siteName}\nContent type: ${metadata.type}\nAuthor: ${metadata.author}\nImage: ${metadata.image}\n`;
    }
    if (imageFiles.length > 0) {
      context += `\n${imageFiles.length} screenshot(s) attached — identify the website, tool, or content shown in each.\n`;
    }
    if (notes) {
      context += `\nUser notes: ${notes}\n`;
    }

    const hasNotes = !!notes;
    const hasImages = imageFiles.length > 0;

    contentBlocks.push({
      type: "text",
      text: `You are helping curate an "Internet Finds" collection for a personal portfolio. Given the inputs below, return find entries.

${context}
Each find has these fields:
- title: Clean, concise title
- type: One of "movie" | "book" | "reel" | "video" | "poetry" | "article" | "music" | "image" | "tool" | "people" | "other" — use "video" for YouTube/Vimeo full-length videos; use "reel" for Instagram reels, TikToks, and YouTube Shorts
- note: A 1-2 sentence personal note about why this is interesting. Write it casual and opinionated. Use the description for context if it's useful, otherwise infer from the title and source. Examples:
  - "John Coffey feeling all the pain in the world and still choosing to give it love."
  - "The origin of ASCII art on the internet. Glenn Chappell built it in 1991, and by the 2000s it had 400+ community-made fonts. A little piece of internet history."
  - "The docking scene still gives me chills. A film about love disguised as sci-fi."
- sourceUrl: The canonical URL for this specific find (use your knowledge to determine the real URL when identified from screenshots)
- imageUrl: A representative image URL (use the OG image if available, leave empty if unknown)
- author: The creator/author if applicable (empty string if none)
- priority: 1, 2, or 3 (1 = minor, 2 = notable, 3 = must-see)

${hasImages ? "For each screenshot, identify what website/tool/app is shown and create a find entry for it. Use your knowledge to find the real URL." : ""}
${hasNotes ? `The user notes may mention websites, tools, or resources. For EACH one mentioned, create a SEPARATE find entry with its own title, type, note, and sourceUrl.${url ? " The first entry should be for the original URL itself." : ""}` : ""}
${!hasImages && !hasNotes ? "Return a JSON array with a single find object." : "Return a JSON array of find objects."}

Return ONLY a valid JSON array, no markdown wrapping, no explanation.`,
    });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: contentBlocks }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";
    const text = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(text);
    const findsArray = Array.isArray(parsed) ? parsed : [parsed];

    const today = new Date().toISOString().split("T")[0];
    const finds = findsArray.map((f: Record<string, unknown>, i: number) => ({
      ...f,
      sourceUrl: (i === 0 && url) ? url : f.sourceUrl || "",
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
