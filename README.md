# NEXUS — CRM personnel

Application web (PWA) qui centralise la gestion de votre entreprise : clients, devis,
tâches, rendez-vous, prospection, emails, un assistant IA et une veille tech/juridique/trading.
Elle s'installe comme une app native sur **iPhone, iPad et Mac** depuis Safari.

## Fonctionnalités

- **Clients** — fiches complètes (coordonnées, SIRET, tags, notes), historique des devis/tâches/RDV
- **Devis** — création avec lignes, calcul HT/TVA/TTC, statuts (brouillon/envoyé/accepté/refusé), export PDF (impression navigateur)
- **Tâches** — vue par colonnes (à faire / en cours / terminées), priorités, échéances, liaison client
- **Rendez-vous** — agenda simple avec vue "à venir" / "passés"
- **Prospection** — pipeline par étapes (nouveau → contacté → relance → RDV → négociation → gagné/perdu), conversion en client
- **Emails** — modèles réutilisables (prospection, relance, devis...) avec variables, ouverture directe dans l'app Mail, historique
- **Assistant IA (NEXUS)** — chat propulsé par l'API Anthropic, avec accès au contexte de votre CRM (tâches du jour, RDV à venir, devis en attente...)
- **Veille & Actus** — agrégation RSS configurable : tech/innovation, trading, droit des entreprises en France, outils de communication
- **Tableau de bord** — chiffre d'affaires, pipeline, tâches du jour, prochains RDV, relances à faire

## Stack technique

- Next.js 14 (App Router, Server Actions) + TypeScript + Tailwind CSS
- Prisma + SQLite (facilement migrable vers PostgreSQL en production)
- Authentification par cookie signé (JWT, `jose`) — compte unique
- Anthropic SDK pour l'assistant IA
- PWA : manifest, service worker, icônes — installable sur iOS/iPadOS/macOS

## Démarrage

```bash
npm install
cp .env.example .env
# éditez .env : renseignez AUTH_SECRET, APP_OWNER_EMAIL, APP_OWNER_PASSWORD, ANTHROPIC_API_KEY
npx prisma db push
npm run db:seed
npm run dev
```

L'application est disponible sur `http://localhost:3000`, connectez-vous avec l'email et le
mot de passe définis dans `.env`.

### Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connexion base de données (SQLite par défaut) |
| `ANTHROPIC_API_KEY` | Clé API pour l'assistant IA NEXUS (console.anthropic.com) |
| `AUTH_SECRET` | Chaîne aléatoire longue pour signer les sessions |
| `APP_OWNER_EMAIL` / `APP_OWNER_PASSWORD` | Identifiants du compte (utilisés par le script de seed) |
| `COMPANY_NAME` | Nom de votre entreprise affiché dans l'app |

## Déploiement

L'app est un projet Next.js standard, déployable sur Vercel, un VPS avec `npm run build && npm run start`,
ou un conteneur Docker. Pensez à :
- utiliser une base **PostgreSQL** en production (changer `provider` dans `prisma/schema.prisma`)
- servir l'app en **HTTPS** (les cookies de session sont marqués `Secure` en production)
- définir toutes les variables d'environnement ci-dessus sur la plateforme d'hébergement

## Installer l'app sur vos appareils

Une fois l'application déployée et accessible via une URL HTTPS :

- **iPhone / iPad** : ouvrez l'URL dans Safari → bouton Partager → *Sur l'écran d'accueil*.
  L'app s'ouvre alors en plein écran, avec sa propre icône, comme une app native.
- **Mac** : ouvrez l'URL dans Safari → menu *Fichier* → *Ajouter au Dock*.

## Limites connues / pistes d'évolution

- L'envoi d'emails se fait via le lien `mailto:` (ouverture de votre app Mail) — pas d'envoi SMTP intégré.
  Pour un envoi automatisé (relances programmées, campagnes), il faudra brancher un fournisseur SMTP/API email.
- Le PDF des devis est généré via l'impression navigateur ("Enregistrer en PDF") plutôt qu'une librairie PDF dédiée.
- Next.js est figé sur la branche 14.2.x (patchée) plutôt que la dernière version majeure (15/16), qui introduit
  des changements d'API significatifs (params/searchParams asynchrones). Une migration est possible mais demande
  d'adapter chaque page — non faite ici pour limiter le risque de régression.
- Aucun test automatisé (unitaire/E2E) n'est inclus pour l'instant.
