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
- **Emails** — modèles réutilisables (prospection, relance, devis...) avec variables, envoi direct via SMTP (si configuré) ou ouverture dans l'app Mail, historique
- **Assistant IA (NEXUS)** — chat propulsé par l'API Anthropic, avec accès au contexte de votre CRM (tâches du jour, RDV à venir, devis en attente...)
- **Veille & Actus** — agrégation RSS configurable : tech/innovation, trading, droit des entreprises en France, outils de communication
- **Tableau de bord** — chiffre d'affaires, pipeline, tâches du jour, prochains RDV, relances à faire

## Stack technique

- Next.js 14 (App Router, Server Actions) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- Authentification par cookie signé (JWT, `jose`) — compte unique
- Anthropic SDK pour l'assistant IA
- PWA : manifest, service worker, icônes — installable sur iOS/iPadOS/macOS

## Démarrage

Il faut une base PostgreSQL disponible (locale ou distante). Le plus rapide en local :

```bash
docker run -d --name nexus-db -e POSTGRES_USER=nexus -e POSTGRES_PASSWORD=nexus \
  -e POSTGRES_DB=nexus -p 5432:5432 postgres:16-alpine
```

Puis :

```bash
npm install
cp .env.example .env
# éditez .env : DATABASE_URL="postgresql://nexus:nexus@localhost:5432/nexus"
# renseignez aussi AUTH_SECRET, APP_OWNER_EMAIL, APP_OWNER_PASSWORD, ANTHROPIC_API_KEY
npx prisma db push
npm run db:seed
npm run dev
```

L'application est disponible sur `http://localhost:3000`, connectez-vous avec l'email et le
mot de passe définis dans `.env`.

### Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `ANTHROPIC_API_KEY` | Clé API pour l'assistant IA NEXUS (console.anthropic.com) |
| `AUTH_SECRET` | Chaîne aléatoire longue pour signer les sessions |
| `APP_OWNER_EMAIL` / `APP_OWNER_PASSWORD` | Identifiants du compte (utilisés par le script de seed) |
| `COMPANY_NAME` | Nom de votre entreprise affiché dans l'app |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Serveur SMTP pour l'envoi réel d'emails (optionnel — sans ça, seul le bouton "Ouvrir dans Mail" est disponible) |

## Déploiement

Dans tous les cas, pensez à :
- servir l'app en **HTTPS** (les cookies de session sont marqués `Secure` en production)
- définir toutes les variables d'environnement listées ci-dessus sur la plateforme d'hébergement
- choisir un `AUTH_SECRET` unique et long (ne réutilisez jamais celui d'un exemple)

### Option A — Vercel (recommandé : accessible de partout, gratuit pour un usage perso)

1. Créez une base Postgres gratuite sur [neon.tech](https://neon.tech) (ou Vercel Postgres,
   Supabase...) et copiez son `DATABASE_URL`.
2. Sur [vercel.com/new](https://vercel.com/new), importez le dépôt GitHub
   `Hexa-digi/logiciel-restore-phone` (branche à déployer : `claude/multi-platform-crm-app-rujs1o`
   ou `main` une fois la PR mergée).
3. Dans les réglages du projet Vercel (Settings → Environment Variables), renseignez toutes les
   variables du tableau ci-dessus (`DATABASE_URL`, `AUTH_SECRET`, `APP_OWNER_EMAIL`,
   `APP_OWNER_PASSWORD`, `ANTHROPIC_API_KEY`, `COMPANY_NAME`, et les `SMTP_*` si besoin).
4. Lancez le déploiement. Une fois en ligne, exécutez une fois (en local, avec `DATABASE_URL`
   pointé sur la base distante) :
   ```bash
   npx prisma db push
   npm run db:seed
   ```
   pour créer le schéma et votre compte.
5. Ouvrez l'URL `https://<votre-projet>.vercel.app` — c'est votre app, accessible de partout.

### Option B — Docker (auto-hébergement, VPS chez vous ou ailleurs)

Le dépôt inclut un `Dockerfile`, un `docker-entrypoint.sh` (synchronise le schéma Prisma au
démarrage) et un `docker-compose.yml` qui embarque aussi PostgreSQL — aucune base externe requise.

```bash
cp .env.example .env
# éditez .env : AUTH_SECRET, APP_OWNER_EMAIL, APP_OWNER_PASSWORD, POSTGRES_PASSWORD, ...
docker compose --env-file .env up --build -d
```

L'app est alors servie sur le port 3000 du conteneur. Placez un reverse proxy (Caddy, Nginx,
Traefik) devant pour le HTTPS et votre nom de domaine. Les données Postgres persistent dans le
volume Docker `nexus-db-data` entre les redémarrages.

### Option C — VPS classique

```bash
npm ci
npx prisma generate
npm run build
npx prisma db push
npm run db:seed   # première installation uniquement
npm run start     # ou pilotez le process avec pm2/systemd
```

## Installer l'app sur vos appareils

Une fois l'application déployée et accessible via une URL HTTPS :

- **iPhone / iPad** : ouvrez l'URL dans Safari → bouton Partager → *Sur l'écran d'accueil*.
  L'app s'ouvre alors en plein écran, avec sa propre icône, comme une app native.
- **Mac** : ouvrez l'URL dans Safari → menu *Fichier* → *Ajouter au Dock*.

## Limites connues / pistes d'évolution

- L'envoi SMTP est synchrone et manuel (bouton "Envoyer maintenant") — il n'y a pas encore de
  relances automatiques programmées (cron) ni de file d'attente pour les campagnes en masse.
- Le PDF des devis est généré via l'impression navigateur ("Enregistrer en PDF") plutôt qu'une librairie PDF dédiée.
- Next.js est figé sur la branche 14.2.x (patchée) plutôt que la dernière version majeure (15/16), qui introduit
  des changements d'API significatifs (params/searchParams asynchrones). Une migration est possible mais demande
  d'adapter chaque page — non faite ici pour limiter le risque de régression.
- Aucun test automatisé (unitaire/E2E) n'est inclus pour l'instant.
