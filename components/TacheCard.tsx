"use client";

import { useTransition } from "react";
import { updateTacheStatut, deleteTache } from "@/lib/actions/taches";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/format";

const NEXT_STATUT: Record<string, string> = {
  a_faire: "en_cours",
  en_cours: "terminee",
  terminee: "a_faire",
};

const NEXT_LABEL: Record<string, string> = {
  a_faire: "Demarrer",
  en_cours: "Terminer",
  terminee: "Reouvrir",
};

export function TacheCard({
  tache,
}: {
  tache: {
    id: string;
    titre: string;
    description: string | null;
    statut: string;
    priorite: string;
    dateEcheance: Date | string | null;
    client: { id: string; nom: string } | null;
  };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="panel space-y-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-100">{tache.titre}</p>
        <StatusBadge status={tache.priorite} />
      </div>
      {tache.description && <p className="text-xs text-slate-500">{tache.description}</p>}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {tache.client && <span>👤 {tache.client.nom}</span>}
        {tache.dateEcheance && <span>📅 {formatDate(tache.dateEcheance)}</span>}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => updateTacheStatut(tache.id, NEXT_STATUT[tache.statut]))}
          className="btn-secondary flex-1 !py-1.5 text-xs"
        >
          {NEXT_LABEL[tache.statut]}
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteTache(tache.id))}
          className="rounded-lg border border-white/10 px-2.5 text-xs text-aria-rose hover:bg-aria-rose/10"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
