import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmailComposer } from "@/components/EmailComposer";
import { createEmailTemplate, deleteEmailTemplate } from "@/lib/actions/emails";
import { timeAgo } from "@/lib/format";
import { requireUser } from "@/lib/auth";

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: { to?: string; prospectId?: string };
}) {
  const [templates, clients, prospects, logs, user] = await Promise.all([
    prisma.emailTemplate.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.client.findMany({ where: { email: { not: null } }, select: { id: true, nom: true, email: true } }),
    prisma.prospect.findMany({ where: { email: { not: null } }, select: { id: true, nom: true, email: true } }),
    prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    requireUser(),
  ]);

  const recipients = [
    ...clients.map((c) => ({ id: c.id, label: c.nom, email: c.email as string, type: "client" as const })),
    ...prospects.map((p) => ({ id: p.id, label: p.nom, email: p.email as string, type: "prospect" as const })),
  ];

  return (
    <div>
      <PageHeader title="Emails" subtitle="Prospection, relances et communication client" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EmailComposer
            templates={templates}
            recipients={recipients}
            defaultTo={searchParams?.to}
            defaultProspectId={searchParams?.prospectId}
            companyName={user?.companyName || "Mon entreprise"}
          />

          <div className="panel mt-6 p-6">
            <h2 className="mb-3 font-display text-sm font-semibold text-slate-100">Historique recent</h2>
            {logs.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun email envoye pour le moment.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {logs.map((l) => (
                  <li key={l.id} className="py-2.5 text-sm">
                    <p className="text-slate-200">{l.sujet}</p>
                    <p className="text-xs text-slate-500">
                      a {l.destinataire} · {timeAgo(l.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="panel p-6">
            <h2 className="mb-3 font-display text-sm font-semibold text-slate-100">Modeles d&apos;emails</h2>
            <ul className="mb-4 space-y-2">
              {templates.map((t) => {
                const deleteWithId = deleteEmailTemplate.bind(null, t.id);
                return (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs">
                    <div>
                      <p className="font-medium text-slate-200">{t.nom}</p>
                      <p className="text-slate-500">{t.categorie}</p>
                    </div>
                    <form action={deleteWithId}>
                      <button type="submit" className="text-aria-rose hover:underline">
                        Suppr.
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>

            <details className="text-sm">
              <summary className="cursor-pointer text-aria-cyan">+ Nouveau modele</summary>
              <form action={createEmailTemplate} className="mt-3 space-y-3">
                <input name="nom" required placeholder="Nom du modele" className="input-field" />
                <select name="categorie" className="input-field" defaultValue="prospection">
                  <option value="prospection">Prospection</option>
                  <option value="relance">Relance</option>
                  <option value="devis">Devis</option>
                  <option value="bienvenue">Bienvenue</option>
                  <option value="general">General</option>
                </select>
                <input name="sujet" required placeholder="Sujet ({{prenom}}, {{entreprise}}...)" className="input-field" />
                <textarea name="corps" required rows={5} placeholder="Corps du message" className="input-field" />
                <button type="submit" className="btn-secondary w-full">
                  Ajouter le modele
                </button>
              </form>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
