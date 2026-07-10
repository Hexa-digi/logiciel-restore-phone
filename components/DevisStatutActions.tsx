"use client";

import { useTransition } from "react";
import { updateDevisStatut } from "@/lib/actions/devis";

const STATUTS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "envoye", label: "Envoye" },
  { value: "accepte", label: "Accepte" },
  { value: "refuse", label: "Refuse" },
];

export function DevisStatutActions({ devisId, statutActuel }: { devisId: string; statutActuel: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {STATUTS.map((s) => (
        <button
          key={s.value}
          disabled={isPending || s.value === statutActuel}
          onClick={() => startTransition(() => updateDevisStatut(devisId, s.value))}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            s.value === statutActuel
              ? "bg-aria-cyan/15 text-aria-cyan"
              : "border border-white/10 text-slate-400 hover:bg-white/5"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
