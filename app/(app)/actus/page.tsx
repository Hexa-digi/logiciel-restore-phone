import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchFeed } from "@/lib/rss";
import { timeAgo } from "@/lib/format";

export const revalidate = 900;

const CATEGORIES: Record<string, string> = {
  tech: "Tech & innovation",
  trading: "Trading & marches",
  juridique: "Droit des entreprises (France)",
  communication: "Outils de communication",
};

export default async function ActusPage({ searchParams }: { searchParams: { cat?: string } }) {
  const sources = await prisma.newsSource.findMany({ where: { actif: true } });

  const results = await Promise.all(sources.map((s) => fetchFeed(s.url, s.nom, s.categorie)));
  const allItems = results.flat().sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  const activeCat = searchParams?.cat;
  const items = activeCat ? allItems.filter((i) => i.categorie === activeCat) : allItems;

  return (
    <div>
      <PageHeader title="Veille & Actus" subtitle="Innovation tech, trading, droit des entreprises et nouveaux outils" />

      <div className="mb-6 flex flex-wrap gap-2">
        <a href="/actus" className={`badge cursor-pointer ${!activeCat ? "border-aria-cyan/40 bg-aria-cyan/10 text-aria-cyan" : "border-white/10 bg-white/5 text-slate-400"}`}>
          Tout
        </a>
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <a
            key={key}
            href={`/actus?cat=${key}`}
            className={`badge cursor-pointer ${activeCat === key ? "border-aria-cyan/40 bg-aria-cyan/10 text-aria-cyan" : "border-white/10 bg-white/5 text-slate-400"}`}
          >
            {label}
          </a>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="panel p-8 text-center text-sm text-slate-500">
          Aucun article recupere pour le moment. Verifiez la connectivite reseau du serveur ou les sources dans les
          parametres.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="panel block p-4 transition hover:border-aria-cyan/30 hover:bg-white/[0.04]"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span className="text-aria-cyan">{item.source}</span>
                {item.pubDate && <span>{timeAgo(item.pubDate)}</span>}
              </div>
              <p className="text-sm font-medium leading-snug text-slate-100">{item.title}</p>
              {item.contentSnippet && <p className="mt-1.5 text-xs text-slate-500 line-clamp-3">{item.contentSnippet}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
