import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDateTime } from "@/lib/format";
import { createRdv } from "@/lib/actions/rdv";
import { DeleteRdvButton } from "@/components/DeleteRdvButton";

export default async function RdvPage() {
  const [rdvs, clients] = await Promise.all([
    prisma.rdv.findMany({
      orderBy: { debut: "asc" },
      include: { client: { select: { id: true, nom: true } } },
    }),
    prisma.client.findMany({ orderBy: { nom: "asc" }, select: { id: true, nom: true } }),
  ]);

  const now = new Date();
  const aVenir = rdvs.filter((r) => new Date(r.debut) >= now);
  const passes = rdvs.filter((r) => new Date(r.debut) < now);

  return (
    <div>
      <PageHeader title="Rendez-vous" subtitle={`${aVenir.length} rendez-vous a venir`} />

      <form action={createRdv} className="panel mb-6 grid gap-3 p-5 sm:grid-cols-12">
        <input name="titre" required placeholder="Titre du rendez-vous" className="input-field sm:col-span-4" />
        <input name="debut" type="datetime-local" required className="input-field sm:col-span-3" />
        <input name="lieu" placeholder="Lieu / visio" className="input-field sm:col-span-2" />
        <select name="clientId" className="input-field sm:col-span-2" defaultValue="">
          <option value="">Sans client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary sm:col-span-1">
          +
        </button>
      </form>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">A venir</h2>
          <div className="space-y-3">
            {aVenir.length === 0 && <p className="text-sm text-slate-500">Aucun rendez-vous a venir.</p>}
            {aVenir.map((r) => (
              <div key={r.id} className="panel flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-100">{r.titre}</p>
                  <p className="mt-1 text-xs text-aria-cyan">{formatDateTime(r.debut)}</p>
                  <p className="text-xs text-slate-500">
                    {r.lieu && `${r.lieu} · `}
                    {r.client?.nom}
                  </p>
                </div>
                <DeleteRdvButton rdvId={r.id} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Passes</h2>
          <div className="space-y-3">
            {passes.length === 0 && <p className="text-sm text-slate-500">Aucun rendez-vous passe.</p>}
            {passes.slice(0, 15).map((r) => (
              <div key={r.id} className="panel flex items-start justify-between gap-3 p-4 opacity-60">
                <div>
                  <p className="text-sm font-medium text-slate-100">{r.titre}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(r.debut)}</p>
                </div>
                <DeleteRdvButton rdvId={r.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
