import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatEUR } from "@/lib/format";

export default async function DevisPage() {
  const devis = await prisma.devis.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, lignes: true },
  });

  const totalPipeline = devis
    .filter((d) => d.statut === "envoye")
    .reduce((s, d) => s + d.lignes.reduce((ls, l) => ls + l.quantite * l.prixUnitaire, 0) * (1 + d.tauxTva / 100), 0);

  return (
    <div>
      <PageHeader
        title="Devis"
        subtitle={`${devis.length} devis · ${formatEUR(totalPipeline)} en attente de reponse`}
        action={
          <Link href="/devis/new" className="btn-primary">
            + Nouveau devis
          </Link>
        }
      />

      <div className="panel overflow-hidden">
        {devis.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Aucun devis pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Numero</th>
                  <th className="px-5 py-3 font-medium">Titre</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Montant TTC</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {devis.map((d) => {
                  const total = d.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0) * (1 + d.tauxTva / 100);
                  return (
                    <tr key={d.id} className="transition hover:bg-white/[0.03]">
                      <td className="px-5 py-3">
                        <Link href={`/devis/${d.id}`} className="font-mono text-xs text-aria-cyan hover:underline">
                          {d.numero}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-200">{d.titre}</td>
                      <td className="px-5 py-3 text-slate-400">{d.client.nom}</td>
                      <td className="px-5 py-3 text-slate-200">{formatEUR(total)}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(d.dateEmission)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={d.statut} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
