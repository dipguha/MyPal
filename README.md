# MyPal

MyPal is a UK family digital assistant — one place for a household to manage health, finances, life admin, recipes, and travel. The top-level tenant is an **account** (one per family) with up to six **members**.

Stack: Next.js (App Router) frontend + BFF · Ruby on Rails (API-only) backend · PostgreSQL · AWS Cognito. For the full picture see [`docs/architecture.md`](docs/architecture.md).

## Run locally

Prerequisites: Docker (with Compose) and Node 20+.

```bash
# 1. Backend + frontend env (fill in the Cognito values — see below)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 2. Start Postgres + the Rails API (http://localhost:3001)
docker compose up -d           # first run also creates & migrates the DB

# 3. Start the frontend (http://localhost:3000)
cd frontend && npm install && npm run dev
```

If the database is empty on first boot, run migrations: `docker compose run --rm backend bin/rails db:prepare`.

**Cognito values** (`COGNITO_*`, `AWS_REGION`) come from AWS Secrets Manager at `mypal-<env>/cognito/web-bff`. The backend reads them from `backend/.env`; the frontend BFF from `frontend/.env.local`. Both `.env` files are gitignored.

**Tests:** `docker compose run --rm -e RAILS_ENV=test backend bundle exec rspec` · `cd frontend && npm run typecheck`.

## More

- Architecture & request flow → [`docs/architecture.md`](docs/architecture.md)
- Architecture decisions → [`docs/adrs.md`](docs/adrs.md)
- Conventions & rules → [`CLAUDE.md`](CLAUDE.md) (+ `backend/CLAUDE.md`, `frontend/CLAUDE.md`)
- Cowork → Code → GitHub workflow → [`_workflow/workflow.md`](_workflow/workflow.md)

> This README can be regenerated from the codebase with `/build_readme`.
