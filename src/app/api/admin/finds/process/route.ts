import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { validateAuth, unauthorized } from "../helpers";

async function fetchPageMetadata(url: string) {
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
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const metadata = await fetchPageMetadata(url);

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are helping curate an "Internet Finds" collection for a personal portfolio. Given a URL and its metadata, return a JSON object for the find.

URL: ${url}
Page title: ${metadata.title}
Description: ${metadata.description}
Site name: ${metadata.siteName}
OG type: ${metadata.type}
Author: ${metadata.author}
OG image: ${metadata.image}

Return a JSON object with these fields:
- title: Clean, concise title
- type: One of "movie" | "book" | "reel" | "video" | "poetry" | "article" | "music" | "image" | "tool" | "people" | "other"
- note: A 1-2 sentence personal note about why this is interesting. Write it casual and opinionated, like these examples:
  - "John Coffey feeling all the pain in the world and still choosing to give it love."
  - "The origin of ASCII art on the internet. Glenn Chappell built it in 1991, and by the 2000s it had 400+ community-made fonts. A little piece of internet history."
  - "The docking scene still gives me chills. A film about love disguised as sci-fi."
- sourceUrl: The canonical URL (use the provided URL)
- imageUrl: A representative image URL (use the OG image if available, or leave empty)
- author: The creator/author if applicable (empty string if none)
- priority: 1, 2, or 3 (1 = minor, 2 = notable, 3 = must-see)

Return ONLY valid JSON, no markdown wrapping, no explanation.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const find = JSON.parse(text);

    find.sourceUrl = url;
    find.dateAdded = new Date().toISOString().split("T")[0];

    return NextResponse.json({ find });
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json(
      { error: "Failed to process URL" },
      { status: 500 }
    );
  }
}
