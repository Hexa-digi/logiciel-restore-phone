import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams?.q?.trim();

  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { nom: { contains: q, mode: "insensitive" } },
            { entreprise: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { devis: true, taches: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} client${clients.length > 1 ? "s" : ""} enregistre${clients.length > 1 ? "s" : ""}`}
        action={
          <Link href="/clients/new" className="btn-primary">
            + Nouveau client
          </Link>
        }
      />

      <form className="mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher un client, une entreprise, un email..."
          className="input-field max-w-md"
        />
      </form>

      <div className="panel overflow-hidden">
        {clients.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Aucun client pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">Entreprise</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Devis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map((client) => (
                  <tr key={client.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link href={`/clients/${client.id}`} className="font-medium text-slate-100 hover:text-aria-cyan">
                        {client.nom}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-400">{client.entreprise || "—"}</td>
                    <td className="px-5 py-3 text-slate-400">{client.email || client.telephone || "—"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={client.statut} />
                    </td>
                    <td className="px-5 py-3 text-slate-400">{client._count.devis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
