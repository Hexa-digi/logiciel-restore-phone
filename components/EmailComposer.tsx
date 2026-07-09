"use client";

import { useMemo, useState } from "react";
import { logEmail } from "@/lib/actions/emails";

type Template = { id: string; nom: string; sujet: string; corps: string; categorie: string };
type Recipient = { id: string; label: string; email: string; type: "client" | "prospect" };

export function EmailComposer({
  templates,
  recipients,
  defaultTo,
  defaultProspectId,
  companyName,
}: {
  templates: Template[];
  recipients: Recipient[];
  defaultTo?: string;
  defaultProspectId?: string;
  companyName: string;
}) {
  const [templateId, setTemplateId] = useState("");
  const [to, setTo] = useState(defaultTo || "");
  const [sujet, setSujet] = useState("");
  const [corps, setCorps] = useState("");

  const selectedRecipient = useMemo(() => recipients.find((r) => r.email === to), [recipients, to]);

  function applyTemplate(id: string) {
    setTemplateId(id);
    const t = templates.find((t) => t.id === id);
    if (!t) return;
    const prenom = selectedRecipient?.label.split(" ")[0] || "";
    const vars: Record<string, string> = {
      "{{prenom}}": prenom,
      "{{entreprise}}": selectedRecipient?.label || "",
      "{{ma_societe}}": companyName,
      "{{signature}}": companyName,
    };
    let s = t.sujet;
    let c = t.corps;
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(k).join(v);
      c = c.split(k).join(v);
    }
    setSujet(s);
    setCorps(c);
  }

  const mailtoHref = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;

  return (
    <form action={logEmail} className="panel space-y-4 p-6">
      <input type="hidden" name="destinataire" value={to} />
      <input type="hidden" name="sujet" value={sujet} />
      <input type="hidden" name="corps" value={corps} />
      {selectedRecipient?.type === "client" && <input type="hidden" name="clientId" value={selectedRecipient.id} />}
      {(selectedRecipient?.type === "prospect" || defaultProspectId) && (
        <input type="hidden" name="prospectId" value={selectedRecipient?.id || defaultProspectId} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Destinataire</label>
          <input
            list="recipients-list"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input-field"
            placeholder="email@exemple.fr"
          />
          <datalist id="recipients-list">
            {recipients.map((r) => (
              <option key={r.id} value={r.email}>
                {r.label}
              </option>
            ))}
          </datalist>
        </div>
        <div>
          <label className="label-field">Modele</label>
          <select value={templateId} onChange={(e) => applyTemplate(e.target.value)} className="input-field">
            <option value="">— Partir de zero —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label-field">Sujet</label>
        <input value={sujet} onChange={(e) => setSujet(e.target.value)} className="input-field" />
      </div>
      <div>
        <label className="label-field">Message</label>
        <textarea value={corps} onChange={(e) => setCorps(e.target.value)} rows={10} className="input-field font-mono" />
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={mailtoHref}
          className="btn-primary"
          aria-disabled={!to || !sujet}
          onClick={(e) => {
            if (!to || !sujet) e.preventDefault();
          }}
        >
          Ouvrir dans Mail
        </a>
        <button type="submit" className="btn-secondary" disabled={!to || !sujet}>
          Marquer comme envoye
        </button>
      </div>
      <p className="text-xs text-slate-500">
        &laquo; Ouvrir dans Mail &raquo; lance votre application mail par defaut (Mail sur iPhone/iPad/Mac, Gmail, etc.)
        avec le message pre-rempli.
      </p>
    </form>
  );
}
