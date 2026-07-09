"use client";

import { useTransition } from "react";
import { deleteRdv } from "@/lib/actions/rdv";

export function DeleteRdvButton({ rdvId }: { rdvId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => deleteRdv(rdvId))}
      className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-aria-rose hover:bg-aria-rose/10"
    >
      Supprimer
    </button>
  );
}
