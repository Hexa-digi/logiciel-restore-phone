"use client";

import { useTransition } from "react";
import { toggleNewsSource, deleteNewsSource } from "@/lib/actions/settings";

export function NewsSourceRow({ source }: { source: { id: string; nom: string; url: string; categorie: string; actif: boolean } }) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-200">{source.nom}</p>
        <p className="truncate text-xs text-slate-500">{source.url}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => toggleNewsSource(source.id, !source.actif))}
          className={`badge cursor-pointer ${source.actif ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/5 text-slate-500"}`}
        >
          {source.actif ? "Actif" : "Inactif"}
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteNewsSource(source.id))}
          className="text-xs text-aria-rose hover:underline"
        >
          Suppr.
        </button>
      </div>
    </li>
  );
}
