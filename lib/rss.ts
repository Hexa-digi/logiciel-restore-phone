import Parser from "rss-parser";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "NexusCRM/1.0" },
});

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  categorie: string;
  pubDate?: string;
  contentSnippet?: string;
};

export async function fetchFeed(url: string, source: string, categorie: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, 8).map((item) => ({
      title: item.title || "(sans titre)",
      link: item.link || "#",
      source,
      categorie,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet?.slice(0, 220),
    }));
  } catch {
    return [];
  }
}
