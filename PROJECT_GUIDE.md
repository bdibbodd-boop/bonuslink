# Project Guide — BonusLink

## 1. Présentation

BonusLink est une application web de récompenses et de parrainage construite avec Next.js, TypeScript, Tailwind CSS et Supabase.

Le projet couvre plusieurs domaines :

- authentification et comptes utilisateurs
- parrainage et tracking de références
- qualification d’un filleul
- attribution de récompenses
- wallet / solde utilisateur
- demandes de retrait
- notifications internes
- sécurité et gestion de fraude
- administration et analytics
- préparation de l’intégration de paiement externe

Le dépôt contient déjà une architecture fonctionnelle avancée, mais certaines parties restent dépendantes d’un environnement réel Supabase et d’un fournisseur de paiement externe.

## 2. Stack technique

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Node.js 20+

## 3. Architecture du dépôt

```text
.
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   └── proxy.ts
├── supabase/
│   ├── config.toml
│   └── migrations/
├── tests/
├── .gitignore
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 4. Application web et routes

### Pages publiques

Le dossier `src/app` contient les pages publiques du site : accueil, FAQ, conditions, confidentialité, parrainage, récompenses, retraits, contact, etc.

### Espace authentifié

Les routes de connexion, inscription et mot de passe oublié sont dans `src/app/(auth)`.

### Dashboard utilisateur

Le dashboard utilisateur est disponible dans `src/app/dashboard`.

### Administration

Le tableau d’administration est dans `src/app/admin`.

### Routes API

Les API routes sont dans `src/app/api` et couvrent notamment :

- `/api/referrals/track`
- `/api/referrals/qualify`
- `/api/notifications/read`
- `/api/payment-methods`
- `/api/withdrawals`
- `/api/admin`

## 5. Architecture Supabase

Le projet s’appuie fortement sur Supabase pour :

- authentification
- base relationnelle
- row level security (RLS)
- fonctions SQL `SECURITY DEFINER`
- RPC (`supabase.rpc(...)`)
- stockage des récompenses, retraits, notifications et admins

Les migrations sont centralisées dans `supabase/migrations`.

### Ordre des migrations

- `0001_initial_schema.sql`
- `0002_business_functions.sql`
- `0003_qualification_workflow.sql`
- `0004_wallet_withdrawal_ledger.sql`
- `0005_notifications.sql`
- `0006_payment_methods_security.sql`
- `0007_fraud_signals.sql`
- `0008_admin_access.sql`
- `0009_admin_operations.sql`
- `0010_campaigns_analytics.sql`
- `0011_security_hardening.sql`
- `0012_admin_rls_recursion_fix.sql`

## 6. Tables principales

### `profiles`

Profil utilisateur, avec :

- `id` (clé primaire, lié à `auth.users`)
- `full_name`
- `referral_code`
- `phone`
- `suspended_at`
- timestamps

### `wallets`

Portefeuille utilisateur avec son solde.

### `referrals`

Association `sponsor_id` / `referred_id`.

### `referral_events`

Événements liés au parrainage : visite, signup, qualification.

### `qualified_visits`

Suivi des visites déjà qualifiées ou dédupliquées.

### `reward_transactions`

Historique créditeur / débiteur des récompenses.

### `payment_methods`

Moyens de paiement enregistrés par les utilisateurs.

### `withdrawals`

Demandes de retrait avec statut et règles métier.

### `fraud_events`

Signaux de fraude, rate limiting et détection d’abus.

### `campaigns`

Campagnes de marketing ou d’acquisition.

### `notifications`

Notifications utilisateur avec statut `read_at`.

### `admin_users`

Membres autorisés à administrer le système.

### `settings`

Réglages métier : bonus, seuil de retrait, qualification, etc.

### `audit_logs`

Journal d’audit des actions admin.

## 7. Système de parrainage

Le système fonctionne avec une logique de code de parrainage et de tracking de visite.

### Flux de base

1. Un utilisateur reçoit un code de parrainage (`referral_code`).
2. Un lien d’inscription est généré avec `?ref=<CODE>`.
3. La page d’inscription transmet le code dans le formulaire.
4. Les visites sont suivies côté serveur via `track_referral_visit`.
5. La qualification du filleul dépend de la présence d’une inscription validée et de conditions de visite / validité.
6. En cas de qualification, le sponsor reçoit un bonus de parrainage.

### Protection anti-abus

Le projet inclut :

- déduplication des visites
- rate limiting par IP et user-agent
- blocage des comptes suspendus
- sécurisation des fonctions SQL

## 8. Règles de qualification

La qualification est gérée par les migrations SQL et les fonctions RPC associées.

Les règles incluent :

- utilisateur authentifié
- compte non suspendu
- email confirmé si requis par le paramètre de configuration
- présence d’un referral actif
- présence d’au moins une visite qualifiante selon le paramètre `qualification_min_visits`
- bonus attribué seulement une fois

## 9. Récompenses et wallet

Le wallet est géré via :

- `wallets.balance`
- `reward_transactions`
- fonctions `credit_reward(...)`
- réglages `signup_bonus`, `referral_bonus`, etc.

Les récompenses sont calculées de façon idempotente via `idempotency_key` pour éviter les doublons.

## 10. Retraits

Le retrait suit les règles suivantes :

- utilisateur authentifié
- compte non suspendu
- moyen de paiement vérifié
- solde suffisant
- montant >= seuil de retrait
- pas de retrait déjà en cours pour le même utilisateur
- débit atomique du wallet
- enregistrement du retrait dans le ledger

Le statut final peut être :

- `PENDING`
- `PROCESSING`
- `APPROVED`
- `PAID`
- `REJECTED`
- `CANCELLED`

## 11. Méthodes de paiement

Le dépôt contient une architecture de méthodes de paiement intégrée dans le code :

- `payment_methods`
- validation du provider
- stockage de la référence du compte
- vérification et sécurité sur les actions utilisateur

### État réel

Le projet n’est pas connecté à un fournisseur de paiement externe réel dans le dépôt.

Cela signifie :

- l’architecture est prête
- les méthodes de paiement sont gérées localement par la plateforme
- l’intégration réelle à un fournisseur doit être ajoutée avec des credentials réelles, webhooks et configuration de production

## 12. Notifications

Le système gère les notifications avec :

- `notifications` table
- `read_at` pour marquer la lecture
- création lors de qualification ou de mise à jour d’un retrait
- lecture via route API dédiée

## 13. Gestion de fraude

Le dépôt contient des signaux de fraude et des protections de sécurité sur les referrals :

- rate limit sur les visites par IP
- signalisation de fraude
- blocage de certains comportements abusifs
- compte suspendu pour les comptes concernés

## 14. Administration

Les fonctions admin incluent :

- suspension de compte
- validation d’un retrait
- mise à jour des paramètres métier
- mise à jour de campagnes
- analytics
- journal d’audit

L’admin est vérifié via `public.is_admin()`.

## 15. RLS et sécurité

Les tables sensibles sont activées avec Row Level Security, avec des politiques permettant :

- lecture de son propre profil / wallet / historique
- lecture des referrals du participant
- lecture des notifications de l’utilisateur
- lecture spécifique admin

Les fonctions critiques utilisent `SECURITY DEFINER` afin d’appliquer les contrôles côté base de données.

## 16. Variables d’environnement

Le projet attend notamment :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REFERRAL_TRACKING_SALT=replace-with-a-long-random-server-secret
```

Ces variables doivent être configurées dans l’environnement de développement ou de production, jamais dans le dépôt Git.

## 17. Installation et lancement

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 18. Tests à exécuter dans un environnement avec terminal

Le dépôt contient des tests métier et de vérification SQL mais ils doivent être exécutés dans un environnement avec terminal.

```bash
npm test
npm run typecheck
npm run build
```

Important : ces commandes ne doivent pas être présentées comme réussies sans exécution réelle.

## 19. Déploiement Vercel

Le projet est prêt pour une application Next.js standard sur Vercel :

- App Router Next.js détecté automatiquement
- package.json standard
- scripts `build` et `dev` compatibles
- Next.js app configured for production build

Pour un déploiement Vercel réel, il faut configurer dans Vercel :

- variables d’environnement Supabase
- variable `REFERRAL_TRACKING_SALT`
- `NEXT_PUBLIC_SITE_URL` = URL de production
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Le dépôt ne contient aucun secret réel, ce qui est conforme à la règle de sécurité.

## 20. Blocages réels

Les éléments suivants restent dépendants d’une configuration externe réelle :

- Supabase de production
- variables de production
- intégration de paiement externe réel
- comptes / credentials tiers
- déploiement Vercel avec accès auth réel

## 21. Conclusion

BonusLink est déjà une base solide et cohérente, avec une architecture projet fonctionnelle et une implémentation crédible du système de récompenses, parrainage et sécurité.

Ce qui manque pour un déploiement public complet n’est pas la structure du dépôt, mais la configuration réelle des services externes et la validation runtime dans un environnement terminal / Vercel authentifié.
