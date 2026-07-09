"use client";

import { useMemo, useState, useTransition } from "react";
import { logEmail, sendEmailNow } from "@/lib/actions/emails";

type Template = { id: string; nom: string; sujet: string; corps: string; categorie: string };
type Recipient = { id: string; label: string; email: string; type: "client" | "prospect" };

export function EmailComposer({
  templates,
  recipients,
  defaultTo,
  defaultProspectId,
  companyName,
  smtpConfigured,
}: {
  templates: Template[];
  recipients: Recipient[];
  defaultTo?: string;
  defaultProspectId?: string;
  companyName: string;
  smtpConfigured: boolean;
}) {
  const [templateId, setTemplateId] = useState("");
  const [to, setTo] = useState(defaultTo || "");
  const [sujet, setSujet] = useState("");
  const [corps, setCorps] = useState("");
  const [isSending, startSending] = useTransition();
  const [sendResult, setSendResult] = useState<{ success: boolean; error?: string } | null>(null);

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

  function handleSendNow() {
    setSendResult(null);
    startSending(async () => {
      const result = await sendEmailNow({
        destinataire: to,
        sujet,
        corps,
        clientId: selectedRecipient?.type === "client" ? selectedRecipient.id : undefined,
        prospectId: selectedRecipient?.type === "prospect" ? selectedRecipient.id : defaultProspectId,
      });
      setSendResult(result);
    });
  }

  return (
    <div className="panel space-y-4 p-6">
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

      {sendResult && (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            sendResult.success
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-aria-rose/30 bg-aria-rose/10 text-aria-rose"
          }`}
        >
          {sendResult.success ? "Email envoye avec succes." : sendResult.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {smtpConfigured && (
          <button
            type="button"
            onClick={handleSendNow}
            disabled={isSending || !to || !sujet}
            className="btn-primary"
          >
            {isSending ? "Envoi..." : "Envoyer maintenant"}
          </button>
        )}
        <a
          href={mailtoHref}
          className={smtpConfigured ? "btn-secondary" : "btn-primary"}
          aria-disabled={!to || !sujet}
          onClick={(e) => {
            if (!to || !sujet) e.preventDefault();
          }}
        >
          Ouvrir dans Mail
        </a>
        <form action={logEmail}>
          <input type="hidden" name="destinataire" value={to} />
          <input type="hidden" name="sujet" value={sujet} />
          <input type="hidden" name="corps" value={corps} />
          {selectedRecipient?.type === "client" && <input type="hidden" name="clientId" value={selectedRecipient.id} />}
          {(selectedRecipient?.type === "prospect" || defaultProspectId) && (
            <input type="hidden" name="prospectId" value={selectedRecipient?.id || defaultProspectId} />
          )}
          <button type="submit" className="btn-secondary" disabled={!to || !sujet}>
            Marquer comme envoye
          </button>
        </form>
      </div>
      <p className="text-xs text-slate-500">
        {smtpConfigured
          ? "« Envoyer maintenant » utilise le serveur SMTP configure. « Ouvrir dans Mail » pre-remplit votre app mail par defaut."
          : "Aucun serveur SMTP configure : « Ouvrir dans Mail » pre-remplit votre app mail par defaut (Mail sur iPhone/iPad/Mac, Gmail...). Configurez le SMTP dans Parametres pour envoyer directement depuis NEXUS."}
      </p>
    </div>
  );
}
