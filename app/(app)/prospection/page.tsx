import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProspectCard } from "@/components/ProspectCard";
import { createProspect } from "@/lib/actions/prospects";

const COLONNES = [
  { etape: "nouveau", label: "Nouveau" },
  { etape: "contacte", label: "Contacte" },
  { etape: "relance", label: "Relance" },
  { etape: "rdv_planifie", label: "RDV planifie" },
  { etape: "negociation", label: "Negociation" },
] as const;

export default async function ProspectionPage() {
  const prospects = await prisma.prospect.findMany({ orderBy: { updatedAt: "desc" } });

  const gagnes = prospects.filter((p) => p.etape === "gagne").length;
  const enCours = prospects.filter((p) => p.etape !== "gagne" && p.etape !== "perdu").length;

  return (
    <div>
      <PageHeader
        title="Prospection"
        subtitle={`${enCours} prospect${enCours > 1 ? "s" : ""} en cours · ${gagnes} converti${gagnes > 1 ? "s" : ""}`}
      />

      <form action={createProspect} className="panel mb-6 grid gap-3 p-5 sm:grid-cols-12">
        <input name="nom" required placeholder="Nom du prospect" className="input-field sm:col-span-3" />
        <input name="entreprise" placeholder="Entreprise" className="input-field sm:col-span-2" />
        <input name="email" type="email" placeholder="Email" className="input-field sm:col-span-3" />
        <input name="source" placeholder="Source (LinkedIn, salon...)" className="input-field sm:col-span-2" />
        <input name="prochaineRelance" type="date" className="input-field sm:col-span-1" />
        <button type="submit" className="btn-primary sm:col-span-1">
          +
        </button>
      </form>

      <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-5">
        {COLONNES.map((col) => (
          <div key={col.etape}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {col.label} ({prospects.filter((p) => p.etape === col.etape).length})
            </h2>
            <div className="space-y-3">
              {prospects
                .filter((p) => p.etape === col.etape)
                .map((p) => (
                  <ProspectCard key={p.id} prospect={p} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
