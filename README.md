# BonusLink

BonusLink est une plateforme de récompenses et de parrainage construite avec Next.js, TypeScript, Tailwind CSS et Supabase.

Le projet est structuré comme une application web de gestion de portefeuille de récompenses, de parrainage, de retraits, d’administration et de sécurité.

## Stack technique

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase (authentification, base de données, RLS, RPC)
- Node.js 20+

## Prérequis

- Node.js 20+
- npm
- un projet Supabase existant
- accès au terminal local pour exécuter les commandes de validation

## Installation

```bash
npm install
cp .env.example .env.local
```

## Variables d’environnement

Copiez le fichier `.env.example` et complétez les valeurs réelles :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REFERRAL_TRACKING_SALT=replace-with-a-long-random-server-secret
```

### Description

- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé anonyme publique de Supabase.
- `NEXT_PUBLIC_SITE_URL` : URL publique du site pour les liens de parrainage et les redirections.
- `REFERRAL_TRACKING_SALT` : secret serveur utilisé pour hacher les valeurs de tracking de parrainage.

## Lancer le projet

```bash
npm run dev
```

Le site est ensuite accessible sur :

```bash
http://localhost:3000
```

## Base de données Supabase

Avant d’activer les parcours authentifiés et les flux de récompenses, appliquer les migrations dans l’ordre suivant :

```bash
# dans le client Supabase ou via CLI Supabase
supabase db push
```

Le dépôt fournit les migrations suivantes :

- `supabase/migrations/0001_initial_schema.sql`
- `supabase/migrations/0002_business_functions.sql`
- `supabase/migrations/0003_qualification_workflow.sql`
- `supabase/migrations/0004_wallet_withdrawal_ledger.sql`
- `supabase/migrations/0005_notifications.sql`
- `supabase/migrations/0006_payment_methods_security.sql`
- `supabase/migrations/0007_fraud_signals.sql`
- `supabase/migrations/0008_admin_access.sql`
- `supabase/migrations/0009_admin_operations.sql`
- `supabase/migrations/0010_campaigns_analytics.sql`
- `supabase/migrations/0011_security_hardening.sql`
- `supabase/migrations/0012_admin_rls_recursion_fix.sql`

## Points d’entrée du projet

- `src/app/` : pages publiques et routes de l’application
- `src/components/` : composants UI réutilisables
- `src/lib/` : helpers, utilitaires et clients Supabase
- `src/app/api/` : API routes server-side
- `src/lib/supabase/` : client browser et client serveur Supabase
- `supabase/migrations/` : schéma SQL et fonctions applicatives
- `tests/` : contrôles métier et vérifications de cohérence du dépôt

## Fonctionnalités principales

### Authentification et comptes

- inscription avec email + mot de passe
- connexion
- mot de passe oublié
- gestion de session Supabase
- protection des routes côté serveur
- séparation des rôles utilisateur et administrateur

### Parrainage

- génération d’un code de parrainage par profil
- liens d’inscription avec paramètre `?ref=CODE`
- tracking de visite avec hachage IP / User-Agent
- déduplication des visites
- qualification du filleul
- attribution de bonus de parrainage

### Récompenses et wallet

- bonus de bienvenue
- bonus de parrainage
- transactions de récompense
- calcul du solde de wallet
- historique des récompenses
- prévention de doublon via idempotency key

### Retraits

- demande de retrait avec montant et moyen de paiement
- seuil minimal configurable
- vérification du solde
- vérification du moyen de paiement vérifié
- vérification de la non-réponse multiple
- statut de retrait : PENDING, PROCESSING, APPROVED, PAID, REJECTED, CANCELLED

### Notifications

- notifications utilisateur
- lecture par `read_at`
- événements de qualification et de mise à jour de retrait

### Administration

- liste des utilisateurs
- suspension / réactivation
- gestion des paramètres métier
- traitement des retraits
- campagnes
- analytics
- journal d’audit

### Paiements

Le dépôt contient une architecture de méthodes de paiement et des méthodes de validation, mais il ne doit pas être présenté comme une intégration complète avec un fournisseur externe réel.

L’état actuel est :

- gestion des méthodes de paiement enregistrées par l’utilisateur
- validation de type/provider
- stockage local de référence de compte
- préparation de l’intégration de fournisseur

L’état non finalisé est :

- connexion réelle à un partenaire de paiement
- webhooks
- validation trafic réel / environnement de production
- secrets et clés API réelles

## Sécurité

Le projet applique plusieurs couches de protection :

- Row Level Security (RLS) sur les tables sensibles
- fonctions SQL `SECURITY DEFINER`
- contrôles d’authentification côté serveur
- verrouillage du solde via update atomique
- validation du rôle administrateur avec `public.is_admin()`
- blocage du compte suspendu sur les actions sensibles
- rate-limiting des visites de parrainage

## Tests à exécuter dans un environnement terminal

Les tests existants sont conçus pour être exécutés dans un terminal local ou CI.

Ne les considérez pas comme passés tant qu’ils n’ont pas été réellement exécutés.

```bash
npm test
npm run typecheck
npm run build
```

## Déploiement

Le dépôt contient une configuration CI GitHub Actions :

- installation des dépendances
- typecheck
- lint
- tests
- build production

Pour déployer en production, il faut installer les variables d’environnement réelles, configurer le projet Supabase, brancher le fournisseur de paiement choisi et vérifier la configuration du domaine / site public.

## Points à surveiller

- les migrations SQL doivent être appliquées dans l’ordre
- les variables d’environnement doivent rester hors du dépôt
- les clés API et secrets ne doivent jamais être commités
- les paiements externes restent à configurer dans un environnement réel
- les vérifications de sécurité doivent être conservées lors des modifications

## Avertissement

Ce projet est une base fonctionnelle avancée, mais il doit être considéré comme une architecture de démonstration / production partiellement prête tant qu’un Supabase réel, les variables d’environnement et les intégrations externes ne sont pas configurés dans un environnement opérationnel.
