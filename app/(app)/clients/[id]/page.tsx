import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDateTime, formatEUR } from "@/lib/format";
import { deleteClient } from "@/lib/actions/clients";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      devis: { orderBy: { createdAt: "desc" }, include: { lignes: true } },
      taches: { orderBy: { createdAt: "desc" } },
      rdvs: { orderBy: { debut: "desc" } },
    },
  });

  if (!client) notFound();

  const deleteWithId = deleteClient.bind(null, client.id);

  return (
    <div>
      <PageHeader
        title={client.nom}
        subtitle={client.entreprise || undefined}
        action={
          <div className="flex gap-2">
            <Link href={`/clients/${client.id}/edit`} className="btn-secondary">
              Modifier
            </Link>
            <form action={deleteWithId}>
              <button type="submit" className="btn-danger">
                Supprimer
              </button>
            </form>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="panel space-y-3 p-5 lg:col-span-1">
          <div className="flex items-center gap-2">
            <StatusBadge status={client.statut} />
          </div>
          <dl className="space-y-2 text-sm">
            {client.email && (
              <div>
                <dt className="text-xs uppercase text-slate-500">Email</dt>
                <dd className="text-slate-200">{client.email}</dd>
              </div>
            )}
            {client.telephone && (
              <div>
                <dt className="text-xs uppercase text-slate-500">Telephone</dt>
                <dd className="text-slate-200">{client.telephone}</dd>
              </div>
            )}
            {client.adresse && (
              <div>
                <dt className="text-xs uppercase text-slate-500">Adresse</dt>
                <dd className="text-slate-200">{client.adresse}</dd>
              </div>
            )}
            {client.siret && (
              <div>
                <dt className="text-xs uppercase text-slate-500">SIRET</dt>
                <dd className="text-slate-200">{client.siret}</dd>
              </div>
            )}
            {client.tags && (
              <div>
                <dt className="text-xs uppercase text-slate-500">Tags</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {client.tags.split(",").map((t) => (
                    <span key={t} className="badge border-white/10 bg-white/5 text-slate-300">
                      {t.trim()}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          {client.notes && (
            <div>
              <dt className="text-xs uppercase text-slate-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{client.notes}</dd>
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">Devis ({client.devis.length})</h2>
              <Link href={`/devis/new?clientId=${client.id}`} className="text-xs font-medium text-aria-cyan hover:underline">
                + Nouveau devis
              </Link>
            </div>
            {client.devis.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun devis pour ce client.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {client.devis.map((d) => {
                  const total = d.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0) * (1 + d.tauxTva / 100);
                  return (
                    <li key={d.id} className="flex items-center justify-between py-2.5 text-sm">
                      <Link href={`/devis/${d.id}`} className="text-slate-200 hover:text-aria-cyan">
                        {d.numero} — {d.titre}
                      </Link>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{formatEUR(total)}</span>
                        <StatusBadge status={d.statut} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="panel p-5">
            <h2 className="mb-3 font-display text-sm font-semibold text-slate-100">Taches ({client.taches.length})</h2>
            {client.taches.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune tache liee.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {client.taches.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-slate-200">{t.titre}</span>
                    <div className="flex items-center gap-3">
                      {t.dateEcheance && <span className="text-xs text-slate-500">{formatDate(t.dateEcheance)}</span>}
                      <StatusBadge status={t.statut} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel p-5">
            <h2 className="mb-3 font-display text-sm font-semibold text-slate-100">Rendez-vous ({client.rdvs.length})</h2>
            {client.rdvs.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun rendez-vous.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {client.rdvs.map((r) => (
                  <li key={r.id} className="py-2.5 text-sm">
                    <p className="text-slate-200">{r.titre}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(r.debut)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
