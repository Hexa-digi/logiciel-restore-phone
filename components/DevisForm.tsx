"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Client } from "@prisma/client";
import { formatEUR } from "@/lib/format";
import { createDevis } from "@/lib/actions/devis";

type Ligne = { description: string; quantite: number; prixUnitaire: number };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Creation..." : "Creer le devis"}
    </button>
  );
}

export function DevisForm({ clients, defaultClientId }: { clients: Client[]; defaultClientId?: string }) {
  const [lignes, setLignes] = useState<Ligne[]>([{ description: "", quantite: 1, prixUnitaire: 0 }]);
  const [tauxTva, setTauxTva] = useState(20);

  const totalHT = useMemo(() => lignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0), 0), [lignes]);
  const totalTTC = totalHT * (1 + tauxTva / 100);

  function updateLigne(i: number, patch: Partial<Ligne>) {
    setLignes((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  return (
    <form action={createDevis} className="space-y-5">
      <input type="hidden" name="lignesJson" value={JSON.stringify(lignes)} />

      <div className="panel grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <label className="label-field">Client *</label>
          <select name="clientId" required defaultValue={defaultClientId || ""} className="input-field">
            <option value="" disabled>
              Selectionner un client
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} {c.entreprise ? `(${c.entreprise})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Titre du devis *</label>
          <input name="titre" required className="input-field" placeholder="Refonte site web" />
        </div>
        <div>
          <label className="label-field">Date de validite</label>
          <input name="dateValidite" type="date" className="input-field" />
        </div>
        <div>
          <label className="label-field">TVA (%)</label>
          <input
            name="tauxTva"
            type="number"
            step="0.1"
            value={tauxTva}
            onChange={(e) => setTauxTva(Number(e.target.value))}
            className="input-field"
          />
        </div>
      </div>

      <div className="panel p-6">
        <h3 className="mb-4 font-display text-sm font-semibold text-slate-100">Lignes du devis</h3>
        <div className="space-y-3">
          {lignes.map((ligne, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                className="input-field col-span-6"
                placeholder="Description"
                value={ligne.description}
                onChange={(e) => updateLigne(i, { description: e.target.value })}
              />
              <input
                className="input-field col-span-2"
                type="number"
                step="0.01"
                placeholder="Qte"
                value={ligne.quantite}
                onChange={(e) => updateLigne(i, { quantite: Number(e.target.value) })}
              />
              <input
                className="input-field col-span-3"
                type="number"
                step="0.01"
                placeholder="Prix unitaire HT"
                value={ligne.prixUnitaire}
                onChange={(e) => updateLigne(i, { prixUnitaire: Number(e.target.value) })}
              />
              <button
                type="button"
                onClick={() => setLignes((prev) => prev.filter((_, idx) => idx !== i))}
                className="col-span-1 rounded-lg border border-white/10 text-aria-rose transition hover:bg-aria-rose/10"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLignes((prev) => [...prev, { description: "", quantite: 1, prixUnitaire: 0 }])}
          className="btn-secondary mt-4"
        >
          + Ajouter une ligne
        </button>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Total HT</span>
              <span>{formatEUR(totalHT)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>TVA ({tauxTva}%)</span>
              <span>{formatEUR(totalHT * (tauxTva / 100))}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1.5 font-semibold text-slate-100">
              <span>Total TTC</span>
              <span>{formatEUR(totalTTC)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <label className="label-field">Notes internes</label>
        <textarea name="notes" rows={3} className="input-field" />
      </div>

      <SubmitButton />
    </form>
  );
}
