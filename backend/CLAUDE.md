# backend/CLAUDE.md

| | |
|---|---|
| **File** | `backend/CLAUDE.md` |
| **Purpose** | All Rails-specific conventions. For global rules (branch naming, locale, auth model overview) see the root `CLAUDE.md`. For ADR rationale see `docs/adrs.md`. |
| **Version** | 1.0 |
| **Updated by** | Cowork |
| **Last updated** | 12/06/2026 18:25 UTC |

**Maintaining this file.** Every edit must: (1) bump the version, (2) update **Last updated** to current UTC time, (3) set **Updated by**, (4) append a revision history row.

---

## App layout

```
backend/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb     # auth gate + current_member
│   │   └── api/
│   │       └── v1/                       # all feature endpoints here
│   ├── models/                           # ActiveRecord models
│   ├── policies/                         # Pundit policies
│   │   └── application_policy.rb        # base policy
│   ├── serializers/                      # Blueprinter serializers
│   │   └── base_serializer.rb           # shared fields (id, created_at)
│   ├── services/                         # business logic
│   └── lib/
│       └── cognito_jwt_verifier.rb      # JWT verification (see Auth section)
├── config/
│   ├── routes.rb
│   └── initializers/
├── db/
│   ├── migrate/                          # Rails migrations
│   └── seeds.rb
├── spec/
│   ├── rails_helper.rb
│   ├── spec_helper.rb
│   ├── requests/                         # request (integration) specs — primary test layer
│   │   └── api/v1/
│   ├── models/
│   ├── policies/
│   └── services/
├── Gemfile
├── Gemfile.lock
└── .env.example
```

---

## Commands

```bash
# from backend/
bundle install
rails server             # dev server on :3001 (Next.js takes :3000)
rails console
rails db:create
rails db:migrate
rails db:rollback
rails db:seed
bundle exec rspec        # all tests
bundle exec rspec spec/requests/api/v1/health_spec.rb  # single file
bundle exec rubocop
bundle exec rubocop -a   # auto-correct safe offences
```

---

## Auth pattern

### JWT verification

The JWT is verified once per request in `app/lib/cognito_jwt_verifier.rb` using the `jwt` gem. It fetches and caches Cognito's JWKS endpoint. Verification raises on expired or invalid tokens.

```ruby
# app/lib/cognito_jwt_verifier.rb
class CognitoJwtVerifier
  JWKS_URL = "https://cognito-idp.#{ENV['AWS_REGION']}.amazonaws.com/#{ENV['COGNITO_USER_POOL_ID']}/.well-known/jwks.json"

  def self.verify(token)
    # fetch JWKS (cached), decode JWT, verify claims
    # returns payload hash on success; raises JWT::DecodeError on failure
  end
end
```

### ApplicationController

```ruby
class ApplicationController < ActionController::API
  include Pundit::Authorization

  before_action :authenticate_request!

  rescue_from Pundit::NotAuthorizedError, with: :forbidden
  rescue_from JWT::DecodeError,           with: :unauthorised

  private

  def authenticate_request!
    token  = request.headers["Authorization"]&.split(" ")&.last
    raise JWT::DecodeError, "Missing token" unless token

    payload     = CognitoJwtVerifier.verify(token)
    @current_user   = User.find_by!(cognito_sub: payload["sub"])
    @current_member = @current_user.member
  end

  def current_user   = @current_user
  def current_member = @current_member

  def forbidden
    render json: { error: "Forbidden" }, status: :forbidden
  end

  def unauthorised
    render json: { error: "Unauthorised" }, status: :unauthorized
  end
end
```

### Account scoping

All queries in services are scoped to `current_member.account_id`. Never query without a scope — never allow cross-account data access.

```ruby
# correct — always scope to account
Expense.where(account_id: current_member.account_id)

# wrong — never query globally
Expense.all
Expense.find(params[:id])  # ← use find_by! + account scope instead
```

---

## Routing

All endpoints are versioned under `/api/v1/`. Health checks at `/healthz` and `/api/v1/ping`.

```ruby
# config/routes.rb
namespace :api do
  namespace :v1 do
    resources :expenses
    resources :members, only: [:index, :show]
    get "ping", to: "health#ping"
  end
end

get "/healthz", to: "health#healthz"
```

---

## Controllers — thin

Controllers handle HTTP only: parse params, call a service, render the serialized result, set status codes. No business logic. No direct ActiveRecord queries (except through a service or scope helper).

```ruby
# app/controllers/api/v1/expenses_controller.rb
class Api::V1::ExpensesController < ApplicationController
  def index
    expenses = ExpenseService.list(account_id: current_member.account_id)
    render json: ExpenseSerializer.render(expenses)
  end

  def create
    expense = ExpenseService.create(current_member, expense_params)
    render json: ExpenseSerializer.render_as_hash(expense), status: :created
  end

  private

  def expense_params
    params.require(:expense).permit(:amount, :description, :category, :date)
  end

  def authorize_resource(record)
    authorize record
  end
end
```

---

## Services — fat

Business logic lives in `app/services/`. Services are plain Ruby objects. They receive a `current_member` and params; they return domain objects or raise.

```ruby
# app/services/expense_service.rb
class ExpenseService
  def self.list(account_id:)
    Expense.where(account_id: account_id).order(date: :desc)
  end

  def self.create(member, params)
    Expense.create!(
      account_id:  member.account_id,
      member_id:   member.id,
      amount:      params[:amount],
      description: params[:description],
      category:    params[:category],
      date:        params[:date]
    )
  end
end
```

---

## Pundit policies

Policies live in `app/policies/`. Every controller action that accesses a resource calls `authorize record` (or `authorize resource_class`).

```ruby
# app/policies/expense_policy.rb
class ExpensePolicy < ApplicationPolicy
  def index?   = member_in_account?
  def show?    = record.account_id == current_member.account_id
  def create?  = member_in_account?
  def update?  = record.account_id == current_member.account_id
  def destroy? = record.account_id == current_member.account_id && admin_or_owner?

  private

  def member_in_account?
    current_member.account_id == record_account_id
  end

  def admin_or_owner?
    current_member.is_admin? || record.member_id == current_member.id
  end
end
```

```ruby
# app/policies/application_policy.rb
class ApplicationPolicy
  attr_reader :current_member, :record

  def initialize(current_member, record)
    raise Pundit::NotAuthorizedError, "Must be logged in" unless current_member
    @current_member = current_member
    @record = record
  end

  # Convenience: resolve account_id from record (most tables have one directly)
  def record_account_id
    record.is_a?(Class) ? nil : record.account_id
  end
end
```

**Rule:** `pundit_user` returns `current_member`, not `current_user`. Policies always receive the member, not the user.

Set in ApplicationController:

```ruby
def pundit_user
  current_member
end
```

---

## Blueprinter serialisers

Serialisers live in `app/serializers/`. Use `BaseSerializer` for shared fields.

```ruby
# app/serializers/base_serializer.rb
class BaseSerializer < Blueprinter::Base
  fields :id, :created_at, :updated_at
end

# app/serializers/expense_serializer.rb
class ExpenseSerializer < BaseSerializer
  fields :amount, :description, :category, :date
  field :member_name do |expense|
    expense.member&.display_name
  end
end
```

Usage:

```ruby
ExpenseSerializer.render(expenses)          # JSON string, array
ExpenseSerializer.render_as_hash(expense)   # hash, single record
```

---

## Migrations

Rails migrations only. Never edit `db/mypal-schema.sql` directly — it is the schema reference document, not the migration source.

```bash
rails generate migration AddDueDateToTasks due_date:date
rails db:migrate
```

**Naming:** `rails generate migration <VerbNounContext>` — descriptive, one operation per migration where possible.

**Drop superseded schema in the same migration.** We are pre-launch with no data to preserve. If a new migration replaces a column, table, or index, drop the old object in the same migration.

---

## RSpec conventions

Tests live in `spec/`. Primary test layer is **request specs** (`spec/requests/`). Unit specs for services and complex models; policy specs for Pundit.

```
spec/
├── requests/api/v1/expenses_spec.rb    # integration — hits the full stack
├── services/expense_service_spec.rb    # unit — service logic
├── models/expense_spec.rb             # unit — validations, scopes
└── policies/expense_policy_spec.rb    # unit — auth rules
```

**File naming:** `spec/<type>/<path matching app/>_spec.rb`

**Request spec pattern:**

```ruby
RSpec.describe "GET /api/v1/expenses", type: :request do
  let(:account)  { create(:account) }
  let(:user)     { create(:user, account: account) }
  let(:member)   { create(:member, account: account, user: user) }

  before { sign_in_as(member) }   # sets Authorization header

  it "returns expenses scoped to account" do
    create(:expense, account: account)
    create(:expense)  # different account — must NOT appear

    get "/api/v1/expenses"

    expect(response).to have_http_status(:ok)
    expect(json_body.size).to eq(1)
  end
end
```

**Never mock the database in request specs.** All request specs use the real DB (via `DatabaseCleaner`). Mocking a model to return true for auth checks is also banned — tests must actually authorise.

---

## Gem choices

| Gem | Purpose | Notes |
|---|---|---|
| `pundit` | Authorisation | Policy per model. `pundit_user` = current_member |
| `blueprinter` | Serialisation | Explicit field lists, no magic. Use `render` / `render_as_hash` |
| `jwt` | Cognito token verification | Used inside `CognitoJwtVerifier` |
| `rack-cors` | CORS headers | Allow Next.js origin in dev; restrict in prod |
| `rspec-rails` | Test framework | |
| `factory_bot_rails` | Test data | Factories in `spec/factories/` |
| `faker` | Test data values | |
| `database_cleaner-active_record` | Clean DB between tests | |
| `rubocop-rails` | Linting | |
| `dotenv-rails` | `.env` loading in dev | |

Adding a gem requires a "because" clause in the PR description or ADR. Do not add `devise`, `active_model_serializers`, `jbuilder`, `cancancan`, or other auth/serialisation alternatives — we have chosen Pundit + Blueprinter.

---

## Error response format

All error responses follow this structure:

```json
{ "error": "Human-readable message", "code": "machine_readable_code" }
```

HTTP status codes:
- `400` — invalid params (failed strong params or validation)
- `401` — missing or invalid JWT
- `403` — valid JWT but insufficient permission (Pundit)
- `404` — record not found (raise `ActiveRecord::RecordNotFound` in service)
- `422` — business logic failure (invalid state, failed save)

---

## Environment variables

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `AWS_REGION` | Cognito region (e.g. `eu-west-2`) |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `RAILS_ENV` | `development` / `test` / `production` |
| `SECRET_KEY_BASE` | Rails session secret |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

---

## Revision history

| Version | Updated by | Last updated (UTC) | Summary |
|---|---|---|---|
| 1.0 | Cowork | 12/06/2026 18:25 UTC | Initial version. Rails API-only conventions: app layout, auth (CognitoJwtVerifier + ApplicationController), account scoping, routing, controller/service split, Pundit, Blueprinter, RSpec request-first testing, gem choices, error format, env vars. |
