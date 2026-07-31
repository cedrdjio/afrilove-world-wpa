# AfroLove World — PWA

Progressive Web App de rencontres afro-européennes. Beau, rapide, installable,
pensé **mobile-first (iPhone & Android)**, hors-ligne, avec l'identité lavande
de la marque.

> **Sprint 00 — Fondations.** Cette branche pose toute l'infrastructure
> technique (architecture, providers, PWA, design system, qualité de code).
> **Aucune fonctionnalité métier** (auth, swipe, chat, premium…) : elles
> arrivent dans les sprints suivants, sans refactoring de ces fondations.

## Stack

| Domaine    | Choix                                                        |
| ---------- | ----------------------------------------------------------- |
| Framework  | **Next.js 16** (App Router) + **React 19** + **TypeScript** strict |
| Style      | **Tailwind CSS v4** (design tokens CSS) + **shadcn/ui** (Radix) |
| Animation  | **Framer Motion** (LazyMotion, reduced-motion)              |
| Données    | **TanStack Query** + **Supabase** (`@supabase/ssr`)         |
| État       | **Zustand** (réglages + surcouches UI)                      |
| Formulaires| **React Hook Form** + **Zod**                               |
| PWA        | Manifeste + **Service Worker** maison (compatible Turbopack) |
| Qualité    | ESLint + Prettier + Husky + lint-staged, `no-explicit-any`  |

> Choix Next 16 : Turbopack est le bundler par défaut. Le Service Worker est
> écrit à la main (sans plugin webpack) pour rester 100 % compatible Turbopack
> et sans dépendance superflue.

## Démarrage

```bash
pnpm install
cp .env.example .env.local   # renseignez vos clés Supabase
pnpm dev                     # http://localhost:3000
```

Scripts : `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`,
`pnpm format`.

## Architecture (Feature First)

```
src/
  app/          Routes (App Router), layout, manifest/robots/sitemap, /offline
  features/     Fonctionnalités métier autonomes (ajoutées par sprint)
  components/   UI partagée : ui/ (shadcn) · brand/ · layout/ · pwa/
  providers/    Contextes globaux composés dans <AppProviders>
  hooks/        Hooks réutilisables (mounted, media-query, online, haptics)
  services/     Accès externes (Supabase : client / server / session)
  store/        Zustand (settings, ui)
  lib/          utils (cn), env (validé par Zod)
  utils/        Helpers purs de formatage
  config/       siteConfig (SEO, PWA)
  constants/    Routes centralisées
  types/        Types transverses
  proxy.ts      Ex-middleware (rafraîchit la session Supabase)
public/         Assets statiques, icônes PWA, sw.js
```

Design system : `src/app/globals.css` (tokens lavande, thèmes clair/sombre,
utilitaires `glass` / `gradient-signature` / `text-gradient`).

## PWA

- Installable (manifeste + icônes 192/512 + maskable + apple-touch).
- Service Worker (`public/sw.js`) : précache de l'app shell, network-first pour
  les navigations avec repli `/offline`, stale-while-revalidate pour le statique
  Next, cache-first plafonné pour les images.
- Enregistré en production via `<ServiceWorkerRegister>` (voir layout).

## Qualité

- `pnpm typecheck` — TypeScript strict, **aucun `any`**.
- `pnpm lint` — ESLint (config Next + Prettier).
- Commit → Husky exécute `lint-staged` (eslint --fix + prettier) sur le staged.

## Prochaines étapes

Sprint 01 : Splash, Onboarding, Authentification (téléphone/email/Google),
création de profil, préférences — sur ces fondations. Voir la base de données
et le kit de migration Supabase sur la branche d'export dédiée.
