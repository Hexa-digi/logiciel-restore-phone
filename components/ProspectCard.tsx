"use client";

import { useTransition } from "react";
import Link from "next/link";
import { updateProspectEtape, deleteProspect, convertProspectToClient } from "@/lib/actions/prospects";
import { formatDate } from "@/lib/format";

const ETAPES = [
  "nouveau",
  "contacte",
  "relance",
  "rdv_planifie",
  "negociation",
  "gagne",
  "perdu",
] as const;

export function ProspectCard({
  prospect,
}: {
  prospect: {
    id: string;
    nom: string;
    entreprise: string | null;
    email: string | null;
    etape: string;
    scoreInteret: number;
    prochaineRelance: Date | string | null;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const idx = ETAPES.indexOf(prospect.etape as (typeof ETAPES)[number]);

  return (
    <div className="panel space-y-2 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-100">{prospect.nom}</p>
          {prospect.entreprise && <p className="text-xs text-slate-500">{prospect.entreprise}</p>}
        </div>
        <span className="text-xs text-aria-amber">{"★".repeat(Math.min(5, prospect.scoreInteret))}</span>
      </div>
      {prospect.email && (
        <Link href={`/emails?to=${encodeURIComponent(prospect.email)}&prospectId=${prospect.id}`} className="text-xs text-aria-cyan hover:underline">
          {prospect.email}
        </Link>
      )}
      {prospect.prochaineRelance && (
        <p className="text-xs text-slate-500">🔔 Relance le {formatDate(prospect.prochaineRelance)}</p>
      )}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {idx > 0 && idx < ETAPES.length - 2 && (
          <button
            disabled={isPending}
            onClick={() => startTransition(() => updateProspectEtape(prospect.id, ETAPES[idx - 1]))}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 hover:bg-white/5"
          >
            ← Retour
          </button>
        )}
        {idx < ETAPES.length - 3 && (
          <button
            disabled={isPending}
            onClick={() => startTransition(() => updateProspectEtape(prospect.id, ETAPES[idx + 1]))}
            className="rounded-lg border border-aria-cyan/20 bg-aria-cyan/10 px-2 py-1 text-xs text-aria-cyan hover:bg-aria-cyan/20"
          >
            Avancer →
          </button>
        )}
        {prospect.etape !== "gagne" && prospect.etape !== "perdu" && (
          <>
            <button
              disabled={isPending}
              onClick={() => startTransition(() => convertProspectToClient(prospect.id))}
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/20"
            >
              ✓ Convertir en client
            </button>
            <button
              disabled={isPending}
              onClick={() => startTransition(() => updateProspectEtape(prospect.id, "perdu"))}
              className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-500 hover:bg-white/5"
            >
              Perdu
            </button>
          </>
        )}
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteProspect(prospect.id))}
          className="ml-auto rounded-lg border border-white/10 px-2 py-1 text-xs text-aria-rose hover:bg-aria-rose/10"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
