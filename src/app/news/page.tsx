"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Newspaper } from "lucide-react";
import NavBar from "@/components/ui/NavBar";
import GlassCard from "@/components/ui/GlassCard";
import type { NewsArticle } from "@/lib/types";

type NewsResponse = {
  updatedAt: string;
  total: number;
  articles: NewsArticle[];
};

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadNews() {
      try {
        const response = await fetch("/api/news", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("news-request-failed");
        }

        const data = (await response.json()) as NewsResponse;
        if (mounted) {
          setArticles(data.articles ?? []);
          setUpdatedAt(data.updatedAt ?? null);
        }
      } catch {
        if (mounted) {
          setArticles([]);
          setUpdatedAt(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadNews();

    return () => {
      mounted = false;
    };
  }, []);

  const bySource = useMemo(() => {
    const counts = new Map<string, number>();
    articles.forEach((article) => {
      counts.set(article.source, (counts.get(article.source) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [articles]);

  const maxCount = useMemo(() => {
    return Math.max(1, ...bySource.map((entry) => entry[1]));
  }, [bySource]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-24 pt-6">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">News Hub</p>
        <h1 className="mt-2 text-2xl font-bold text-emerald-950">Farming News You Can Read Here</h1>
        <p className="mt-1 text-sm text-slate-600">
          {updatedAt ? `Last updated ${new Date(updatedAt).toLocaleString()}` : "Loading latest agricultural headlines..."}
        </p>
      </header>

      <section className="space-y-4">
        <GlassCard className="p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            <Newspaper className="h-4 w-4" />
            Source Mix Graph
          </div>
          <div className="space-y-2">
            {bySource.length ? (
              bySource.map(([source, count]) => (
                <div key={source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="truncate pr-3">{source}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-emerald-100">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: `${Math.max(12, Math.round((count / maxCount) * 100))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">News sources will appear here once loaded.</p>
            )}
          </div>
        </GlassCard>

        {loading ? <p className="text-sm font-semibold text-slate-600">Loading in-app news feed...</p> : null}

        {articles.map((article) => (
          <GlassCard key={`${article.link}-${article.title}`} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{article.source}</p>
            <h2 className="mt-2 text-lg font-bold text-emerald-950">{article.title}</h2>
            {article.summary ? <p className="mt-2 text-sm leading-6 text-slate-700">{article.summary}</p> : null}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleString() : "Fresh update"}</span>
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-900"
              >
                Open source
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </GlassCard>
        ))}
      </section>

      <NavBar activeTab="news" />
    </main>
  );
}
