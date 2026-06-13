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

## Managing the services

**Backend + DB** (Docker Compose, run from the project root):

```bash
docker compose up -d            # start db + Rails API (http://localhost:3001)
docker compose stop             # stop (keeps the database volume)
docker compose down             # stop + remove containers (data survives; add -v to wipe data)
docker compose restart backend  # restart Rails (needed after Gemfile/.env/config changes)
docker compose ps               # status
```

Ruby code hot-reloads (source is bind-mounted); only `Gemfile`/`.env`/`config/` changes need a `restart backend`.

**Frontend** (Next.js, run from `frontend/`):

```bash
npm run dev                                            # foreground at http://localhost:3000 (Ctrl-C to stop)
# or in the background:
nohup npm run dev > /tmp/mypal_next_dev.log 2>&1 &     # start detached
pkill -f "next dev"                                    # stop
```

**Logs:**

```bash
docker compose logs -f backend       # Rails (follow; --tail=100 for last 100)
docker compose logs -f db            # Postgres
tail -f /tmp/mypal_next_dev.log      # frontend (only when started in the background)
```

**Health checks:**

```bash
curl -s -w "frontend %{http_code}\n" -o /dev/null http://localhost:3000
curl -s -w "backend %{http_code}\n" http://localhost:3001/healthz
```

## More

- Architecture & request flow → [`docs/architecture.md`](docs/architecture.md)
- Architecture decisions → [`docs/adrs.md`](docs/adrs.md)
- Conventions & rules → [`CLAUDE.md`](CLAUDE.md) (+ `backend/CLAUDE.md`, `frontend/CLAUDE.md`)
- Cowork → Code → GitHub workflow → [`_workflow/workflow.md`](_workflow/workflow.md)

> This README can be regenerated from the codebase with `/build_readme`.
