"use client";

import { useFormStatus } from "react-dom";
import type { Client } from "@prisma/client";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Enregistrement..." : label}
    </button>
  );
}

export function ClientForm({
  client,
  action,
  submitLabel,
}: {
  client?: Client;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  return (
    <form action={action} className="panel space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Nom *</label>
          <input name="nom" defaultValue={client?.nom} required className="input-field" placeholder="Jean Dupont" />
        </div>
        <div>
          <label className="label-field">Entreprise</label>
          <input name="entreprise" defaultValue={client?.entreprise || ""} className="input-field" placeholder="Acme SARL" />
        </div>
        <div>
          <label className="label-field">Email</label>
          <input name="email" type="email" defaultValue={client?.email || ""} className="input-field" placeholder="jean@acme.fr" />
        </div>
        <div>
          <label className="label-field">Telephone</label>
          <input name="telephone" defaultValue={client?.telephone || ""} className="input-field" placeholder="06 12 34 56 78" />
        </div>
        <div>
          <label className="label-field">SIRET</label>
          <input name="siret" defaultValue={client?.siret || ""} className="input-field" />
        </div>
        <div>
          <label className="label-field">Statut</label>
          <select name="statut" defaultValue={client?.statut || "actif"} className="input-field">
            <option value="actif">Actif</option>
            <option value="prospect">Prospect</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Adresse</label>
          <input name="adresse" defaultValue={client?.adresse || ""} className="input-field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Tags (separes par des virgules)</label>
          <input name="tags" defaultValue={client?.tags || ""} className="input-field" placeholder="vip, ecommerce, recurrent" />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Notes</label>
          <textarea name="notes" defaultValue={client?.notes || ""} rows={4} className="input-field" />
        </div>
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
