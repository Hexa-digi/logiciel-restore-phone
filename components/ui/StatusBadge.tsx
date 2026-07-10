const STYLES: Record<string, string> = {
  // devis
  brouillon: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  envoye: "border-aria-blue/30 bg-aria-blue/10 text-aria-blue",
  accepte: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  refuse: "border-aria-rose/30 bg-aria-rose/10 text-aria-rose",
  // taches
  a_faire: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  en_cours: "border-aria-amber/30 bg-aria-amber/10 text-aria-amber",
  terminee: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  // priorite
  basse: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  normale: "border-aria-blue/30 bg-aria-blue/10 text-aria-blue",
  haute: "border-aria-amber/30 bg-aria-amber/10 text-aria-amber",
  urgente: "border-aria-rose/30 bg-aria-rose/10 text-aria-rose",
  // prospection
  nouveau: "border-aria-blue/30 bg-aria-blue/10 text-aria-blue",
  contacte: "border-aria-violet/30 bg-aria-violet/10 text-aria-violet",
  relance: "border-aria-amber/30 bg-aria-amber/10 text-aria-amber",
  rdv_planifie: "border-aria-cyan/30 bg-aria-cyan/10 text-aria-cyan",
  negociation: "border-aria-amber/30 bg-aria-amber/10 text-aria-amber",
  gagne: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  perdu: "border-aria-rose/30 bg-aria-rose/10 text-aria-rose",
  // client
  actif: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  inactif: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  prospect: "border-aria-violet/30 bg-aria-violet/10 text-aria-violet",
};

const LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoye: "Envoye",
  accepte: "Accepte",
  refuse: "Refuse",
  a_faire: "A faire",
  en_cours: "En cours",
  terminee: "Terminee",
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
  nouveau: "Nouveau",
  contacte: "Contacte",
  relance: "Relance",
  rdv_planifie: "RDV planifie",
  negociation: "Negociation",
  gagne: "Gagne",
  perdu: "Perdu",
  actif: "Actif",
  inactif: "Inactif",
  prospect: "Prospect",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STYLES[status] || "border-slate-500/30 bg-slate-500/10 text-slate-300"}`}>
      {LABELS[status] || status}
    </span>
  );
}
