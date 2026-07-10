import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDateTime, formatEUR } from "@/lib/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    nbClients,
    tachesDuJour,
    tachesEnRetard,
    prochainsRdv,
    devisEnvoyes,
    devisAcceptesAnnee,
    prospectsActifs,
    prospectsARelancer,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.tache.findMany({
      where: { statut: { not: "terminee" }, dateEcheance: { gte: startOfDay, lt: endOfDay } },
      orderBy: { priorite: "desc" },
      include: { client: { select: { nom: true } } },
    }),
    prisma.tache.count({ where: { statut: { not: "terminee" }, dateEcheance: { lt: startOfDay } } }),
    prisma.rdv.findMany({
      where: { debut: { gte: now } },
      orderBy: { debut: "asc" },
      take: 5,
      include: { client: { select: { nom: true } } },
    }),
    prisma.devis.findMany({ where: { statut: "envoye" }, include: { lignes: true } }),
    prisma.devis.findMany({
      where: { statut: "accepte", dateEmission: { gte: startOfYear } },
      include: { lignes: true },
    }),
    prisma.prospect.count({ where: { etape: { notIn: ["gagne", "perdu"] } } }),
    prisma.prospect.findMany({
      where: { prochaineRelance: { lte: endOfDay }, etape: { notIn: ["gagne", "perdu"] } },
      orderBy: { prochaineRelance: "asc" },
      take: 5,
    }),
  ]);

  const pipelineDevis = devisEnvoyes.reduce(
    (s, d) => s + d.lignes.reduce((ls, l) => ls + l.quantite * l.prixUnitaire, 0) * (1 + d.tauxTva / 100),
    0
  );
  const caAnnee = devisAcceptesAnnee.reduce(
    (s, d) => s + d.lignes.reduce((ls, l) => ls + l.quantite * l.prixUnitaire, 0) * (1 + d.tauxTva / 100),
    0
  );

  const heure = now.getHours();
  const salutation = heure < 12 ? "Bonjour" : heure < 18 ? "Bon apres-midi" : "Bonsoir";

  return (
    <div>
      <PageHeader
        title={`${salutation}, ${user?.name || "Commandant"}`}
        subtitle="Voici l'etat de votre entreprise en temps reel"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chiffre d'affaires (annee)" value={formatEUR(caAnnee)} accent="cyan" hint={`${devisAcceptesAnnee.length} devis acceptes`} />
        <StatCard label="Pipeline devis" value={formatEUR(pipelineDevis)} accent="blue" hint={`${devisEnvoyes.length} en attente de reponse`} />
        <StatCard label="Clients" value={String(nbClients)} accent="violet" />
        <StatCard label="Prospects actifs" value={String(prospectsActifs)} accent="amber" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-100">Taches du jour</h2>
            <Link href="/taches" className="text-xs text-aria-cyan hover:underline">
              Voir tout
            </Link>
          </div>
          {tachesEnRetard > 0 && (
            <p className="mb-3 rounded-lg border border-aria-rose/30 bg-aria-rose/10 px-3 py-2 text-xs text-aria-rose">
              {tachesEnRetard} tache{tachesEnRetard > 1 ? "s" : ""} en retard
            </p>
          )}
          {tachesDuJour.length === 0 ? (
            <p className="text-sm text-slate-500">Rien de prevu aujourd&apos;hui.</p>
          ) : (
            <ul className="space-y-2.5">
              {tachesDuJour.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">{t.titre}</span>
                  <StatusBadge status={t.priorite} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel p-5 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-100">Prochains rendez-vous</h2>
            <Link href="/rdv" className="text-xs text-aria-cyan hover:underline">
              Voir tout
            </Link>
          </div>
          {prochainsRdv.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun rendez-vous a venir.</p>
          ) : (
            <ul className="space-y-3">
              {prochainsRdv.map((r) => (
                <li key={r.id} className="text-sm">
                  <p className="text-slate-200">{r.titre}</p>
                  <p className="text-xs text-aria-cyan">{formatDateTime(r.debut)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel p-5 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-100">Relances a faire</h2>
            <Link href="/prospection" className="text-xs text-aria-cyan hover:underline">
              Voir tout
            </Link>
          </div>
          {prospectsARelancer.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune relance prevue.</p>
          ) : (
            <ul className="space-y-2.5">
              {prospectsARelancer.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">{p.nom}</span>
                  {p.prochaineRelance && <span className="text-xs text-aria-amber">{formatDate(p.prochaineRelance)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-5 panel p-5">
        <h2 className="mb-3 font-display text-sm font-semibold text-slate-100">Acces rapide</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/clients/new" className="btn-secondary">
            + Client
          </Link>
          <Link href="/devis/new" className="btn-secondary">
            + Devis
          </Link>
          <Link href="/prospection" className="btn-secondary">
            + Prospect
          </Link>
          <Link href="/assistant" className="btn-secondary">
            ✦ Demander a NEXUS
          </Link>
          <Link href="/actus" className="btn-secondary">
            ◍ Veille du jour
          </Link>
        </div>
      </div>
    </div>
  );
}
