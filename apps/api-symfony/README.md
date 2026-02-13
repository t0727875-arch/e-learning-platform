# Symfony API (migration target)

This folder contains a Symfony-based API scaffold intended to replace the existing `apps/api` Node/Express backend while keeping the React web app unchanged.

## What is included

- Minimal Symfony project structure (`public/`, `src/`, `config/`).
- API-first controller examples:
  - `GET /api/health`
  - `POST /api/subscribe`
  - `GET /api/auth/google` (placeholder)
- Environment template for PostgreSQL/Redis parity with the existing stack.

## What still needs migration

- Full route coverage from `apps/api/routes/*.ts` (see `docs/symfony-migration/route-inventory.md`).
- Authentication/session strategy equivalent to the current middleware.
- Database access layer migration from Drizzle ORM to Doctrine DBAL/ORM.
- Validation migration from Zod schemas to Symfony Validator constraints.

## Local setup

```bash
cd apps/api-symfony
cp .env.example .env
composer install
php -S 0.0.0.0:8000 -t public
```

> In this environment, `composer install` may fail due to restricted network access to Packagist.

## Create a new GitHub repo and push this project

From repository root:

```bash
git checkout -b feat/symfony-api-migration
# (apply and commit changes)
git remote add new-origin git@github.com:<your-org-or-user>/<new-repo>.git
git push -u new-origin feat/symfony-api-migration
```

If you want both the React app and Symfony API in the new repo, push the entire monorepo.
If you only want the migrated backend, push the `apps/api-symfony` folder contents as a standalone repo.
