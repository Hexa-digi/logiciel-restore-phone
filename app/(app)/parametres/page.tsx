import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateCompanyProfile, createNewsSource } from "@/lib/actions/settings";
import { NewsSourceRow } from "@/components/NewsSourceRow";

export default async function ParametresPage() {
  const [user, sources] = await Promise.all([requireUser(), prisma.newsSource.findMany({ orderBy: { categorie: "asc" } })]);
  const aiConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Parametres" subtitle="Profil, assistant IA et sources de veille" />

      <div className="panel p-6">
        <h2 className="mb-4 font-display text-sm font-semibold text-slate-100">Profil de l&apos;entreprise</h2>
        <form action={updateCompanyProfile} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Votre nom</label>
            <input name="name" defaultValue={user?.name || ""} className="input-field" />
          </div>
          <div>
            <label className="label-field">Nom de l&apos;entreprise</label>
            <input name="companyName" defaultValue={user?.companyName || ""} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      <div className="panel p-6">
        <h2 className="mb-2 font-display text-sm font-semibold text-slate-100">Assistant IA</h2>
        <p className="text-sm text-slate-400">
          Statut :{" "}
          <span className={aiConfigured ? "text-emerald-400" : "text-aria-rose"}>
            {aiConfigured ? "Cle API configuree" : "Cle API absente"}
          </span>
        </p>
        {!aiConfigured && (
          <p className="mt-2 text-xs text-slate-500">
            Ajoutez la variable d&apos;environnement <code className="rounded bg-white/10 px-1">ANTHROPIC_API_KEY</code> sur
            votre serveur (fichier <code className="rounded bg-white/10 px-1">.env</code>) pour activer NEXUS. Cle disponible
            sur console.anthropic.com.
          </p>
        )}
      </div>

      <div className="panel p-6">
        <h2 className="mb-4 font-display text-sm font-semibold text-slate-100">Sources de veille (RSS)</h2>
        <ul className="mb-4 space-y-2">
          {sources.map((s) => (
            <NewsSourceRow key={s.id} source={s} />
          ))}
        </ul>
        <details>
          <summary className="cursor-pointer text-sm text-aria-cyan">+ Ajouter une source</summary>
          <form action={createNewsSource} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input name="nom" required placeholder="Nom de la source" className="input-field" />
            <select name="categorie" className="input-field" defaultValue="tech">
              <option value="tech">Tech & innovation</option>
              <option value="trading">Trading & marches</option>
              <option value="juridique">Droit des entreprises</option>
              <option value="communication">Outils de communication</option>
            </select>
            <input name="url" required placeholder="URL du flux RSS" className="input-field sm:col-span-2" />
            <button type="submit" className="btn-secondary sm:col-span-2">
              Ajouter
            </button>
          </form>
        </details>
      </div>

      <div className="panel p-6">
        <h2 className="mb-2 font-display text-sm font-semibold text-slate-100">Installer sur vos appareils</h2>
        <p className="text-sm text-slate-400">
          Sur iPhone/iPad : ouvrez NEXUS dans Safari, appuyez sur Partager puis &laquo; Sur l&apos;ecran d&apos;accueil &raquo;.
          Sur Mac : ouvrez NEXUS dans Safari puis menu Fichier &gt; &laquo; Ajouter au Dock &raquo;. L&apos;application
          s&apos;ouvre alors en plein ecran, comme une app native.
        </p>
      </div>
    </div>
  );
}
