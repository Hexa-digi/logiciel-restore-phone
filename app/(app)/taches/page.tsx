import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { TacheCard } from "@/components/TacheCard";
import { createTache } from "@/lib/actions/taches";

const COLONNES = [
  { statut: "a_faire", label: "A faire" },
  { statut: "en_cours", label: "En cours" },
  { statut: "terminee", label: "Terminees" },
] as const;

export default async function TachesPage() {
  const [taches, clients] = await Promise.all([
    prisma.tache.findMany({
      orderBy: [{ dateEcheance: "asc" }, { createdAt: "desc" }],
      include: { client: { select: { id: true, nom: true } } },
    }),
    prisma.client.findMany({ orderBy: { nom: "asc" }, select: { id: true, nom: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Taches" subtitle={`${taches.length} tache${taches.length > 1 ? "s" : ""} au total`} />

      <form action={createTache} className="panel mb-6 grid gap-3 p-5 sm:grid-cols-12">
        <input name="titre" required placeholder="Nouvelle tache..." className="input-field sm:col-span-4" />
        <select name="clientId" className="input-field sm:col-span-3" defaultValue="">
          <option value="">Sans client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <select name="priorite" className="input-field sm:col-span-2" defaultValue="normale">
          <option value="basse">Basse</option>
          <option value="normale">Normale</option>
          <option value="haute">Haute</option>
          <option value="urgente">Urgente</option>
        </select>
        <input name="dateEcheance" type="date" className="input-field sm:col-span-2" />
        <button type="submit" className="btn-primary sm:col-span-1">
          +
        </button>
      </form>

      <div className="grid gap-5 md:grid-cols-3">
        {COLONNES.map((col) => (
          <div key={col.statut}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {col.label} ({taches.filter((t) => t.statut === col.statut).length})
            </h2>
            <div className="space-y-3">
              {taches
                .filter((t) => t.statut === col.statut)
                .map((t) => (
                  <TacheCard key={t.id} tache={t} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
