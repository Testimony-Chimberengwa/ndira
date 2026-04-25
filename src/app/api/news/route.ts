import { NextResponse } from "next/server";
import type { NewsArticle } from "@/lib/types";

type FeedSource = {
  name: string;
  url: string;
};

const FEEDS: FeedSource[] = [
  { name: "AllAfrica Agriculture", url: "https://allafrica.com/tools/headlines/rdf/agriculture/headlines.rdf" },
  { name: "UN FAO News", url: "https://www.fao.org/news/rss/rss.xml" },
  { name: "ReliefWeb Food Security", url: "https://reliefweb.int/updates?advanced-search=%28S1767%29_%28T4593%29&search=food%20security&format=rss" },
];

function decodeXmlEntities(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[|\]\]>/g, "");
}

function extractTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1] ? decodeXmlEntities(match[1].trim()) : undefined;
}

function parseRssItems(xml: string, source: string): NewsArticle[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  return items.slice(0, 8).map((item) => {
    const title = extractTag(item, "title") ?? "Untitled article";
    const link = extractTag(item, "link") ?? "#";
    const summary = extractTag(item, "description");
    const publishedAt = extractTag(item, "pubDate") ?? extractTag(item, "dc:date");

    return {
      title,
      link,
      source,
      publishedAt,
      summary,
    } satisfies NewsArticle;
  });
}

export async function GET() {
  try {
    const articlesNested = await Promise.all(
      FEEDS.map(async (feed) => {
        try {
          const response = await fetch(feed.url, { cache: "no-store" });
          if (!response.ok) {
            return [] as NewsArticle[];
          }

          const xml = await response.text();
          return parseRssItems(xml, feed.name);
        } catch {
          return [] as NewsArticle[];
        }
      })
    );

    const articles = articlesNested.flat().sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      total: articles.length,
      articles: articles.slice(0, 18),
    });
  } catch {
    return NextResponse.json({ error: "Could not load news right now." }, { status: 500 });
  }
}
