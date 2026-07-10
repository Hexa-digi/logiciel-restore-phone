import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatEUR } from "@/lib/format";
import { deleteDevis } from "@/lib/actions/devis";
import { DevisStatutActions } from "@/components/DevisStatutActions";

export default async function DevisDetailPage({ params }: { params: { id: string } }) {
  const devis = await prisma.devis.findUnique({
    where: { id: params.id },
    include: { client: true, lignes: { orderBy: { ordre: "asc" } } },
  });

  if (!devis) notFound();

  const totalHT = devis.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
  const totalTVA = totalHT * (devis.tauxTva / 100);
  const totalTTC = totalHT + totalTVA;
  const deleteWithId = deleteDevis.bind(null, devis.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={devis.numero}
        subtitle={devis.titre}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/imprimer/devis/${devis.id}`} target="_blank" className="btn-secondary">
              Imprimer / PDF
            </Link>
            <form action={deleteWithId}>
              <button type="submit" className="btn-danger">
                Supprimer
              </button>
            </form>
          </div>
        }
      />

      <div className="panel mb-5 flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-400">Client :</span>
          <Link href={`/clients/${devis.client.id}`} className="font-medium text-aria-cyan hover:underline">
            {devis.client.nom}
          </Link>
        </div>
        <StatusBadge status={devis.statut} />
      </div>

      <DevisStatutActions devisId={devis.id} statutActuel={devis.statut} />

      <div className="panel mt-5 overflow-hidden p-6">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium">Qte</th>
              <th className="pb-2 font-medium">PU HT</th>
              <th className="pb-2 text-right font-medium">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {devis.lignes.map((l) => (
              <tr key={l.id}>
                <td className="py-2.5 text-slate-200">{l.description}</td>
                <td className="py-2.5 text-slate-400">{l.quantite}</td>
                <td className="py-2.5 text-slate-400">{formatEUR(l.prixUnitaire)}</td>
                <td className="py-2.5 text-right text-slate-200">{formatEUR(l.quantite * l.prixUnitaire)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Total HT</span>
              <span>{formatEUR(totalHT)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>TVA ({devis.tauxTva}%)</span>
              <span>{formatEUR(totalTVA)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1.5 font-semibold text-slate-100">
              <span>Total TTC</span>
              <span>{formatEUR(totalTTC)}</span>
            </div>
          </div>
        </div>

        {devis.dateValidite && (
          <p className="mt-4 text-xs text-slate-500">Valide jusqu&apos;au {formatDate(devis.dateValidite)}</p>
        )}
        {devis.notes && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-400">{devis.notes}</p>}
      </div>
    </div>
  );
}
