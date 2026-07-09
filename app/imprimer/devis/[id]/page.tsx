import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate, formatEUR } from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function ImprimerDevisPage({ params }: { params: { id: string } }) {
  const devis = await prisma.devis.findUnique({
    where: { id: params.id },
    include: { client: true, lignes: { orderBy: { ordre: "asc" } } },
  });

  if (!devis) notFound();

  const totalHT = devis.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
  const totalTVA = totalHT * (devis.tauxTva / 100);
  const totalTTC = totalHT + totalTVA;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="no-print sticky top-0 z-10 flex justify-end border-b border-slate-200 bg-white p-4">
        <PrintButton />
      </div>
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Devis {devis.numero}</h1>
            <p className="mt-1 text-sm text-slate-500">Emis le {formatDate(devis.dateEmission)}</p>
            {devis.dateValidite && (
              <p className="text-sm text-slate-500">Valide jusqu&apos;au {formatDate(devis.dateValidite)}</p>
            )}
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-semibold">{devis.client.nom}</p>
            {devis.client.entreprise && <p>{devis.client.entreprise}</p>}
            {devis.client.adresse && <p>{devis.client.adresse}</p>}
            {devis.client.email && <p>{devis.client.email}</p>}
          </div>
        </div>

        <h2 className="mb-2 text-lg font-semibold">{devis.titre}</h2>

        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-800 text-left">
              <th className="py-2">Description</th>
              <th className="py-2">Qte</th>
              <th className="py-2">PU HT</th>
              <th className="py-2 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {devis.lignes.map((l) => (
              <tr key={l.id} className="border-b border-slate-200">
                <td className="py-2">{l.description}</td>
                <td className="py-2">{l.quantite}</td>
                <td className="py-2">{formatEUR(l.prixUnitaire)}</td>
                <td className="py-2 text-right">{formatEUR(l.quantite * l.prixUnitaire)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total HT</span>
              <span>{formatEUR(totalHT)}</span>
            </div>
            <div className="flex justify-between">
              <span>TVA ({devis.tauxTva}%)</span>
              <span>{formatEUR(totalTVA)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-800 pt-1.5 text-base font-bold">
              <span>Total TTC</span>
              <span>{formatEUR(totalTTC)}</span>
            </div>
          </div>
        </div>

        {devis.notes && (
          <div className="mt-10 border-t border-slate-200 pt-4 text-sm text-slate-600">
            <p className="font-medium">Notes</p>
            <p className="whitespace-pre-wrap">{devis.notes}</p>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
