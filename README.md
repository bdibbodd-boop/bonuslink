# BonusLink

Plateforme de récompenses et de parrainage construite avec Next.js, TypeScript, Tailwind CSS et Supabase.

## Développement

```bash
npm install
cp .env.example .env.local
npm run dev
```

Appliquer `supabase/migrations/0001_initial_schema.sql` dans un projet Supabase avant d'activer les parcours authentifies. Les fournisseurs de paiement ne sont pas connectes a ce stade.
