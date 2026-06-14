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

## Full setup walkthrough

The quickstart above is the TL;DR. This section spells out every step. The backend + Postgres run in Docker; the frontend runs on the host. Run all commands from the project root unless noted.

**Prerequisites:** Docker Desktop running (Compose v2) · Node 20+ · ports `3000`, `3001`, `5433` free.

### First-time setup (from a fresh clone)

The Rails app, `backend/Dockerfile.dev`, and `docker-compose.yml` are committed, so you don't scaffold anything — you set up env, gems, and the database.

```bash
# 1. Env files — fill in the Cognito values (see "Cognito values" above)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 2. Build the backend dev image (pulls ruby:3.3 on first run, installs system libs)
docker compose build backend

# 3. Install gems into the bundle volume (generates Gemfile.lock if missing)
docker compose run --rm backend bundle install

# 4. Start Postgres (the container auto-creates the mypal_development database)
docker compose up -d db

# 5. Create + migrate the development and test databases
docker compose run --rm backend bin/rails db:prepare
docker compose run --rm -e RAILS_ENV=test backend bin/rails db:prepare

# 6. Start the full stack (db + Rails API on http://localhost:3001)
docker compose up -d

# 7. Verify the backend
curl -s http://localhost:3001/healthz        # => {"status":"ok"}

# 8. Start the frontend (http://localhost:3000)
cd frontend && npm install && npm run dev
```

Open **http://localhost:3000** (sign-up is at `/sign-up`).

### Day-to-day

```bash
docker compose up -d                 # start db + backend
cd frontend && npm run dev           # start frontend (Ctrl-C to stop)
# ...work...
docker compose stop                  # stop backend + db (data preserved)
```

Ruby code hot-reloads (source is bind-mounted). After certain changes:

```bash
docker compose run --rm backend bundle install    # Gemfile changed
docker compose restart backend                     # Gemfile / .env / config/ changed
docker compose run --rm backend bin/rails db:migrate   # new migrations pulled
```

### Ports & data

| Service | URL / port | Notes |
|---|---|---|
| Frontend (Next.js) | http://localhost:3000 | runs on the host |
| Backend (Rails API) | http://localhost:3001 | Docker; browser hits it via the BFF, not directly |
| PostgreSQL | `localhost:5433` | Docker (5432 inside the container; 5433 avoids the old MyDigitalPals DB) |

Data lives in the `mypal_pgdata` volume, gems in `bundle_data`. `docker compose down` keeps both; only `docker compose down -v` wipes them.

### How the Rails app was originally scaffolded (one-time, already committed)

You won't repeat this — it's here for reference. The app was generated in a throwaway container so it never touched the host Ruby:

```bash
docker run --rm -v "$PWD/backend":/app -w /app ruby:3.3 bash -c \
  "gem install rails -v '~> 7.2.0' --no-document && \
   rails new . --api -d postgresql --skip-test --skip-bundle --skip-git --force"
```

Then `backend/Dockerfile.dev`, the root `docker-compose.yml`, `backend/.env`, and a `DATABASE_URL`-driven `config/database.yml` were added, followed by first-time setup steps 2–7 above.

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
