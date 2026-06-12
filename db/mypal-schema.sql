-- ================================================================
--  MyPal — Schema File (v3.0, corrected)
--  61 tables · PostgreSQL 15+ / Aurora Serverless v2
--
--  RUN:
--    psql -U postgres -d mypal -f mypal-schema.sql
--    Then: psql -U postgres -d mypal -f mypal-seed.sql
--
-- ================================================================
--
--  RELATIONSHIP FIXES vs previous version
--  ───────────────────────────────────────────────────────────────
--  ANSWERED: member_roles has no member_id — this is CORRECT.
--    member_roles is a LOOKUP table (same pattern as account_types).
--    The link is: members.role_id SMALLINT FK → member_roles.id
--    A member POINTS TO a role. A role does not contain member IDs.
--
--  FIX 1 — Missing ON DELETE clauses added:
--    vehicle_maintenance.account_id  → CASCADE
--    medical_appointments.account_id → CASCADE
--    bill_payments.member_id         → SET NULL
--    expenses.member_id              → SET NULL
--    medication_logs.member_id       → CASCADE
--
--  FIX 2 — Nullable FKs now have ON DELETE SET NULL:
--    budgets.member_id, savings_goals.member_id,
--    investments.member_id, documents.member_id,
--    notes.member_id, shopping_items.checked_by
--
--  FIX 3 — created_by / added_by refs now SET NULL:
--    recipes, meal_plans, shopping_lists, shopping_items, trips, notes
--
--  FIX 4 — UUID[] arrays replaced with junction tables:
--    trips.travellers         → trip_members
--
--  FIX 5 — SMALLINT[] arrays replaced with junction tables:
--    briefing_settings.news_category_ids → member_news_categories
--    briefing_settings.news_source_ids   → member_news_sources
--
--  FIX 6 — Redundant column removed:
--    todo_items.account_id removed (derives via list_id → todo_lists)
--
--  ON DELETE DECISION GUIDE:
--    CASCADE  → child has no meaning without parent
--    SET NULL → child is a record that should survive parent removal
--    (no clause / RESTRICT never used — would block member deletion)
--
-- ================================================================
--  TABLE INVENTORY  (57 tables)
-- ================================================================
--  Block  1  Identity & Settings   (9)
--            account_types, accounts, users,
--            member_roles, role_permissions, members,
--            social_logins, account_settings, member_settings
--  Block  2  Notifications         (1)  notifications
--  Block  3  Daily Briefing        (6)
--            news_categories, news_sources,
--            briefing_settings, briefing_cache,
--            member_news_categories, member_news_sources
--  Block  4  To Dos                (3)
--            todo_categories, todo_items, todo_audit
--  Block  5  (retired — reminders feature removed)
--  Block  6  Finance               (7)
--            bills, bill_payments, subscriptions,
--            budgets, expenses, savings_goals, investments
--  Block  7  Documents             (1)  documents
--  Block  8  Notes                 (1)  notes
--  Block  9  Vehicle & Home        (3)
--            vehicles, vehicle_maintenance, home_maintenance
--  Block 10  Health               (10)
--            health_goal_types, health_profiles,
--            member_health_goals, health_logs, bp_logs,
--            food_entries, medications, medication_logs,
--            workouts, medical_appointments
--  Block 11  Recipes & Grocery     (4)
--            recipes, meal_plans, shopping_lists, shopping_items
--  Block 12  Journal               (2)  journal_entries, journal_media
--  Block 13  Hobbies               (2)  interests, feed_items
--  Block 14  Travel                (3)  trips, trip_members, trip_items
--  Block 15  Pet Care              (3)  pets, pet_vaccinations, pet_vet_visits
--  Block 16  Infrastructure        (2)  media_files, audit_logs
-- ================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================================
--  BLOCK 1 — IDENTITY & SETTINGS  (9 tables)
-- ================================================================

-- [1.1] account_types  (lookup — accounts.account_type_id → id)
CREATE TABLE account_types (
    id            SMALLSERIAL  PRIMARY KEY,
    code          VARCHAR(20)  NOT NULL UNIQUE,
    display_name  VARCHAR(100) NOT NULL,
    max_members   SMALLINT     NOT NULL DEFAULT 1,
    description   TEXT,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE account_types IS 'Lookup: plan types. accounts.account_type_id → id. Add new types via INSERT only.';

-- [1.2] accounts
CREATE TABLE accounts (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    account_type_id  SMALLINT    NOT NULL REFERENCES account_types(id),
    family_name      VARCHAR(150),
    plan             VARCHAR(20) NOT NULL DEFAULT 'free'
                         CHECK (plan IN ('free','solo_pro','family')),
    plan_started_at  TIMESTAMPTZ,
    plan_expires_at  TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);
COMMENT ON TABLE accounts IS 'Top-level entity. All family data scoped via account_id.';

-- [1.3] users  (one per human who can log in)
CREATE TABLE users (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    cognito_sub     VARCHAR(255) UNIQUE NOT NULL,
    email           CITEXT       UNIQUE,
    phone           VARCHAR(30)  UNIQUE,
    email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    phone_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);
COMMENT ON TABLE users IS 'Auth identity. cognito_sub = Cognito sub claim. Children may have no user row.';

-- [1.4] member_roles  (lookup + self-referential hierarchy)
-- ──────────────────────────────────────────────────────────────
--  HOW THIS TABLE LINKS TO members:
--
--  member_roles is a LOOKUP table — it stores role DEFINITIONS.
--  It works exactly like account_types.
--
--  The link direction is:   members.role_id FK ──▶ member_roles.id
--
--  James → role_id = 1 → points to 'admin' row in member_roles
--  Sarah → role_id = 2 → points to 'partner' row in member_roles
--  Lily  → role_id = 4 → points to 'child' row in member_roles
--
--  member_roles does NOT have member_id.
--  It stores WHAT a role is. WHO has it is in members.role_id.
--
--  parent_role_id builds the hierarchy:
--    admin (id=1, parent=NULL)
--    └─ partner     (id=2, parent=1)
--       └─ member   (id=3, parent=2)
--          ├─ child       (id=4, parent=3)
--          └─ grandparent (id=5, parent=3)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE member_roles (
    id              SMALLSERIAL  PRIMARY KEY,
    code            VARCHAR(30)  NOT NULL UNIQUE,
    display_name    VARCHAR(100) NOT NULL,
    parent_role_id  SMALLINT     REFERENCES member_roles(id),
    description     TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order      SMALLINT     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE member_roles IS
  'Lookup + hierarchy. members.role_id → id.
   parent_role_id (self-ref): admin → partner → member → child.
   Stores WHAT roles ARE. WHO has them is in members.role_id.';

-- [1.5] role_permissions
CREATE TABLE role_permissions (
    id          SERIAL       PRIMARY KEY,
    role_id     SMALLINT     NOT NULL REFERENCES member_roles(id) ON DELETE CASCADE,
    capability  VARCHAR(80)  NOT NULL,
    granted     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (role_id, capability)
);
COMMENT ON TABLE role_permissions IS 'Capability flags per role. App queries for permission checks.';

-- [1.6] members  (one profile per person)
-- role_id → member_roles is the link between a person and their role
CREATE TABLE members (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id    UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id       UUID         REFERENCES users(id) ON DELETE SET NULL,
    role_id       SMALLINT     NOT NULL REFERENCES member_roles(id),
    display_name  VARCHAR(100) NOT NULL,
    first_name    VARCHAR(80),
    last_name     VARCHAR(80),
    date_of_birth DATE,
    avatar_url    TEXT,
    is_admin      BOOLEAN      NOT NULL DEFAULT FALSE,
    color_hex     VARCHAR(7)   NOT NULL DEFAULT '#6478f0',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);
COMMENT ON TABLE members IS
  'account_id → accounts (CASCADE).
   user_id → users (SET NULL): profile survives user deletion.
   role_id → member_roles: member POINTS TO role definition.
   user_id NULL = child with no login.';

-- [1.7] social_logins
CREATE TABLE social_logins (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider         VARCHAR(20) NOT NULL CHECK (provider IN ('google','facebook','apple','phone','email')),
    provider_user_id VARCHAR(255) NOT NULL,
    email            CITEXT,
    linked_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_user_id)
);

-- [1.8] account_settings  (one per account)
CREATE TABLE account_settings (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID        NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
    currency        CHAR(3)     NOT NULL DEFAULT 'GBP',
    timezone        VARCHAR(60) NOT NULL DEFAULT 'Europe/London',
    date_format     VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
    week_starts_on  SMALLINT    NOT NULL DEFAULT 1 CHECK (week_starts_on BETWEEN 0 AND 6),
    family_sharing  JSONB       NOT NULL DEFAULT '{}',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [1.9] member_settings  (one per member)
CREATE TABLE member_settings (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id           UUID        NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    theme               VARCHAR(10) NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light')),
    notification_prefs  JSONB NOT NULL DEFAULT '{"email":true,"sms":true,"push":true,"digest_time":"08:00"}',
    briefing_prefs      JSONB NOT NULL DEFAULT '{"weather":true,"commute":true,"school_commute":true,"news":true,"email":true,"on_this_day":true}',
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
--  BLOCK 2 — NOTIFICATIONS  (1 table)
-- ================================================================

CREATE TABLE notifications (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    type        VARCHAR(50)  NOT NULL,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    read_at     TIMESTAMPTZ,
    action_url  TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE notifications IS 'read_at NULL = unread.';

-- ================================================================
--  BLOCK 3 — DAILY BRIEFING  (6 tables)
-- ================================================================

-- [3.1] news_categories  (master lookup)
CREATE TABLE news_categories (
    id            SMALLSERIAL  PRIMARY KEY,
    code          VARCHAR(40)  NOT NULL UNIQUE,
    display_name  VARCHAR(100) NOT NULL,
    icon          VARCHAR(10),
    api_param     VARCHAR(40),
    rss_feeds     TEXT[],
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order    SMALLINT     NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE news_categories IS 'api_param = exact NewsAPI string (sports not sport).';

-- [3.2] news_sources  (master lookup)
CREATE TABLE news_sources (
    id            SMALLSERIAL   PRIMARY KEY,
    code          VARCHAR(60)   NOT NULL UNIQUE,
    display_name  VARCHAR(150)  NOT NULL,
    api_id        VARCHAR(60),
    rss_url       TEXT,
    country_code  CHAR(2)       NOT NULL DEFAULT 'GB',
    category_id   SMALLINT      REFERENCES news_categories(id) ON DELETE SET NULL,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- [3.3] briefing_settings  (FIX 5: news arrays removed)
CREATE TABLE briefing_settings (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id        UUID        NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    home_postcode    VARCHAR(10),
    work_address     TEXT,
    school_address   TEXT,
    commute_mode     VARCHAR(20) NOT NULL DEFAULT 'driving'
                         CHECK (commute_mode IN ('driving','transit','walking','cycling')),
    email_provider   VARCHAR(20) CHECK (email_provider IN ('gmail','outlook','none')),
    show_on_this_day BOOLEAN     NOT NULL DEFAULT TRUE,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE briefing_settings IS
  'FIX 5: news_category_ids and news_source_ids arrays removed.
   News selections → member_news_categories + member_news_sources.';

-- [3.4] briefing_cache
CREATE TABLE briefing_cache (
    id                   UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id            UUID  NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    cache_date           DATE  NOT NULL,
    weather_data         JSONB,
    commute_data         JSONB,
    school_commute_data  JSONB,
    news_data            JSONB,
    email_summary        JSONB,
    on_this_day          JSONB,
    generated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, cache_date)
);
COMMENT ON TABLE briefing_cache IS 'Daily briefing snapshot. Rebuilt by cron at 06:00 UK.';

-- [3.5] member_news_categories  (junction — FIX 5)
-- Replaces briefing_settings.news_category_ids SMALLINT[]
-- members ──< member_news_categories >── news_categories
CREATE TABLE member_news_categories (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id    UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    category_id  SMALLINT    NOT NULL REFERENCES news_categories(id) ON DELETE CASCADE,
    sort_order   SMALLINT    NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_member_category UNIQUE (member_id, category_id)
);
COMMENT ON TABLE member_news_categories IS
  'FIX 5: replaces SMALLINT[] array. Real FK enforcement.
   UNIQUE(member_id, category_id). sort_order = display sequence.';

-- [3.6] member_news_sources  (junction — FIX 5)
-- Replaces briefing_settings.news_source_ids SMALLINT[]
-- members ──< member_news_sources >── news_sources
CREATE TABLE member_news_sources (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id  UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    source_id  SMALLINT    NOT NULL REFERENCES news_sources(id) ON DELETE CASCADE,
    sort_order SMALLINT    NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_member_source UNIQUE (member_id, source_id)
);
COMMENT ON TABLE member_news_sources IS 'FIX 5: replaces SMALLINT[] array.';

-- ================================================================
--  BLOCK 4 — TO DOS  (3 tables)
-- ================================================================

-- [4.1] todo_categories  (master/seed; 17 default values inserted below)
CREATE TABLE todo_categories (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        CITEXT      NOT NULL UNIQUE,
    label       VARCHAR(40) NOT NULL,
    sort_order  INT         NOT NULL DEFAULT 100,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO todo_categories (slug, label, sort_order) VALUES
    ('admin',    'Admin',    10),
    ('bills',    'Bills',    20),
    ('car',      'Car',      30),
    ('errands',  'Errands',  40),
    ('family',   'Family',   50),
    ('finance',  'Finance',  60),
    ('food',     'Food',     70),
    ('health',   'Health',   80),
    ('home',     'Home',     90),
    ('personal', 'Personal', 100),
    ('pets',     'Pets',     110),
    ('school',   'School',   120),
    ('shopping', 'Shopping', 130),
    ('social',   'Social',   140),
    ('travel',   'Travel',   150),
    ('work',     'Work',     160),
    ('other',    'Other',    999);

-- [4.2] todo_items
--   account_id     CASCADE: items removed with the account
--   member FKs     SET NULL: items survive member removal (become unassigned/orphaned)
--   visibility     'private' = creator-only · 'family' = whole account
--   archived_at    set when due_date passes for a completed item (see scheduler)
CREATE TABLE todo_items (
    id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id               UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    title                    VARCHAR(500) NOT NULL,
    description              TEXT,
    priority                 VARCHAR(10)  NOT NULL DEFAULT 'normal'
                                 CHECK (priority IN ('low','normal','high')),
    visibility               VARCHAR(10)  NOT NULL DEFAULT 'private'
                                 CHECK (visibility IN ('private','family')),
    todo_category_id         UUID         NOT NULL REFERENCES todo_categories(id) ON DELETE RESTRICT,
    created_by_member_id     UUID         REFERENCES members(id) ON DELETE SET NULL,
    assigned_to_member_id    UUID         REFERENCES members(id) ON DELETE SET NULL,
    assigned_at              TIMESTAMPTZ,
    assigned_by              UUID         REFERENCES members(id) ON DELETE SET NULL,
    due_date                 DATE,
    completed_at             TIMESTAMPTZ,
    completed_by_member_id   UUID         REFERENCES members(id) ON DELETE SET NULL,
    archived_at              TIMESTAMPTZ,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at               TIMESTAMPTZ
);

-- [4.3] todo_audit  (full action log; created/completed/reopened/archived/edited/reassigned)
CREATE TABLE todo_audit (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    todo_item_id     UUID        NOT NULL REFERENCES todo_items(id) ON DELETE CASCADE,
    action           VARCHAR(20) NOT NULL
                         CHECK (action IN ('created','completed','reopened','archived','edited','reassigned')),
    actor_member_id  UUID        REFERENCES members(id) ON DELETE SET NULL,
    snapshot         JSONB       NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
--  BLOCK 5 — (RETIRED)
-- ================================================================
-- The Reminders feature was removed in Alembic revision 0011_drop_reminders.
-- The historical schema lived here as `reminders` (and earlier as
-- `reminders` + `reminder_members` + `reminder_fires` + `reminder_occurrences`).

-- ================================================================
--  BLOCK 6 — FINANCE  (7 tables)
-- ================================================================

-- [6.1] bills
CREATE TABLE bills (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name            VARCHAR(200)  NOT NULL,
    category        VARCHAR(50),
    amount          NUMERIC(10,2) NOT NULL,
    currency        CHAR(3)       NOT NULL DEFAULT 'GBP',
    frequency       VARCHAR(20)   NOT NULL
                        CHECK (frequency IN ('one_off','weekly','monthly','quarterly','annually')),
    due_day         SMALLINT,
    next_due_date   DATE,
    auto_pay        BOOLEAN       NOT NULL DEFAULT FALSE,
    provider        VARCHAR(150),
    account_number  VARCHAR(100),
    notes           TEXT,
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- [6.2] bill_payments  (FIX 1: member_id SET NULL added)
CREATE TABLE bill_payments (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id         UUID          NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    member_id       UUID          REFERENCES members(id) ON DELETE SET NULL,
    amount_paid     NUMERIC(10,2) NOT NULL,
    paid_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    payment_method  VARCHAR(50),
    reference       VARCHAR(150),
    notes           TEXT,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE bill_payments IS 'FIX 1: member_id SET NULL. Payment is a financial fact.';

-- [6.3] subscriptions
CREATE TABLE subscriptions (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name            VARCHAR(200)  NOT NULL,
    category        VARCHAR(80),
    amount          NUMERIC(10,2) NOT NULL,
    currency        CHAR(3)       NOT NULL DEFAULT 'GBP',
    billing_cycle   VARCHAR(20)   NOT NULL DEFAULT 'monthly'
                        CHECK (billing_cycle IN ('weekly','monthly','annually')),
    next_renewal    DATE,
    last_used_at    DATE,
    provider_url    TEXT,
    notes           TEXT,
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);
COMMENT ON TABLE subscriptions IS 'last_used_at drives AI unused-subscription nudges.';

-- [6.4] budgets  (FIX 2: member_id SET NULL added)
CREATE TABLE budgets (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id  UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    member_id   UUID          REFERENCES members(id) ON DELETE SET NULL,
    name        VARCHAR(150)  NOT NULL,
    amount      NUMERIC(10,2) NOT NULL,
    period      VARCHAR(10)   NOT NULL CHECK (period IN ('weekly','monthly','yearly')),
    category    VARCHAR(80),
    start_date  DATE          NOT NULL,
    end_date    DATE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE budgets IS 'FIX 2: member_id SET NULL. NULL member_id = family-wide budget.';

-- [6.5] expenses  (FIX 1: member_id SET NULL added)
CREATE TABLE expenses (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    member_id       UUID          REFERENCES members(id) ON DELETE SET NULL,
    budget_id       UUID          REFERENCES budgets(id) ON DELETE SET NULL,
    description     VARCHAR(255)  NOT NULL,
    amount          NUMERIC(10,2) NOT NULL,
    category        VARCHAR(80),
    expense_date    DATE          NOT NULL,
    payment_method  VARCHAR(50),
    receipt_url     TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE expenses IS 'FIX 1: member_id SET NULL. Expense is a financial fact.';

-- [6.6] savings_goals  (FIX 2: member_id SET NULL added)
CREATE TABLE savings_goals (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    member_id       UUID          REFERENCES members(id) ON DELETE SET NULL,
    name            VARCHAR(200)  NOT NULL,
    icon            VARCHAR(10),
    target_amount   NUMERIC(10,2) NOT NULL,
    current_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
    target_date     DATE,
    notes           TEXT,
    completed       BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE savings_goals IS 'FIX 2: member_id SET NULL. NULL = family goal.';

-- [6.7] investments  (FIX 2: member_id SET NULL added)
CREATE TABLE investments (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    member_id       UUID          REFERENCES members(id) ON DELETE SET NULL,
    name            VARCHAR(200)  NOT NULL,
    type            VARCHAR(50)   NOT NULL
                        CHECK (type IN ('isa','pension','stocks','property','savings','other')),
    provider        VARCHAR(150),
    account_ref     VARCHAR(100),
    current_value   NUMERIC(12,2) NOT NULL DEFAULT 0,
    contributions   NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE investments IS 'FIX 2: member_id SET NULL.';

-- ================================================================
--  BLOCK 7 — DOCUMENTS  (1 table)
-- ================================================================

-- [7.1] documents  (FIX 2: member_id SET NULL added)
CREATE TABLE documents (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id       UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    member_id        UUID         REFERENCES members(id) ON DELETE SET NULL,
    name             VARCHAR(300) NOT NULL,
    category         VARCHAR(50)  NOT NULL
                         CHECK (category IN ('passport','insurance','vehicle',
                                             'property','medical','warranty','legal','other')),
    document_number  VARCHAR(100),
    issued_by        VARCHAR(200),
    issue_date       DATE,
    expiry_date      DATE,
    file_url         TEXT,
    notes            TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);
COMMENT ON TABLE documents IS
  'FIX 2: member_id SET NULL. NULL = family document (MOT, home insurance).
   expiry_date drives v_documents_expiring view.';

-- ================================================================
--  BLOCK 8 — NOTES  (1 table)
-- ================================================================

-- [8.1] notes  (FIX 2: member_id SET NULL  |  FIX 3: created_by SET NULL)
-- Two member FKs are intentional:
--   member_id  = whose note this is (subject/owner)
--   created_by = who physically wrote it (author)
CREATE TABLE notes (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id  UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    member_id   UUID         REFERENCES members(id) ON DELETE SET NULL,
    title       VARCHAR(300) NOT NULL,
    content     TEXT,
    category    VARCHAR(50)  NOT NULL DEFAULT 'general'
                    CHECK (category IN ('home','car','tech','security',
                                        'contacts','medical','general','other')),
    pinned      BOOLEAN      NOT NULL DEFAULT FALSE,
    visibility  VARCHAR(10)  NOT NULL DEFAULT 'family'
                    CHECK (visibility IN ('private','partner','family')),
    created_by  UUID         REFERENCES members(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);
COMMENT ON TABLE notes IS
  'FIX 2: member_id SET NULL (subject). FIX 3: created_by SET NULL (author).
   Both FKs serve different purposes and are both correct.';

-- ================================================================
--  BLOCK 9 — VEHICLE & HOME  (3 tables)
-- ================================================================

-- [9.1] vehicles
CREATE TABLE vehicles (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id  UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    make        VARCHAR(100) NOT NULL,
    model       VARCHAR(100) NOT NULL,
    year        SMALLINT,
    reg_plate   VARCHAR(20),
    colour      VARCHAR(50),
    fuel_type   VARCHAR(20)  CHECK (fuel_type IN ('petrol','diesel','electric','hybrid','other')),
    mileage     INT,
    notes       TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- [9.2] vehicle_maintenance  (FIX 1: account_id CASCADE added)
CREATE TABLE vehicle_maintenance (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID         NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    account_id      UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type            VARCHAR(50)  NOT NULL
                        CHECK (type IN ('mot','service','tyre','insurance','tax','repair','other')),
    description     VARCHAR(300),
    completed_date  DATE,
    due_date        DATE,
    mileage_at      INT,
    cost            NUMERIC(8,2),
    provider        VARCHAR(200),
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE vehicle_maintenance IS 'FIX 1: account_id CASCADE added.';

-- [9.3] home_maintenance
CREATE TABLE home_maintenance (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id      UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name            VARCHAR(300) NOT NULL,
    category        VARCHAR(50)  NOT NULL DEFAULT 'general'
                        CHECK (category IN ('boiler','plumbing','electrical','roofing',
                                            'garden','appliance','security','general','other')),
    completed_date  DATE,
    due_date        DATE,
    cost            NUMERIC(8,2),
    provider        VARCHAR(200),
    warranty_until  DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ================================================================
--  BLOCK 10 — HEALTH  (10 tables)
-- ================================================================

-- [10.1] health_goal_types  (master lookup)
CREATE TABLE health_goal_types (
    id             SMALLSERIAL   PRIMARY KEY,
    code           VARCHAR(50)   NOT NULL UNIQUE,
    display_name   VARCHAR(150)  NOT NULL,
    description    TEXT,
    unit           VARCHAR(30)   NOT NULL,
    icon           VARCHAR(10),
    default_value  NUMERIC(10,2) NOT NULL,
    min_value      NUMERIC(10,2),
    max_value      NUMERIC(10,2),
    applies_to     VARCHAR(10)   NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all','adult','child')),
    display_order  SMALLINT      NOT NULL DEFAULT 0,
    is_active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE health_goal_types IS 'Lookup. member_health_goals.goal_type_id → id. New goals = INSERT only.';

-- [10.2] health_profiles
CREATE TABLE health_profiles (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id     UUID         NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    height_cm     NUMERIC(5,1),
    weight_kg     NUMERIC(5,1),
    bmi           NUMERIC(4,1) GENERATED ALWAYS AS
                      (ROUND(weight_kg / NULLIF((height_cm/100.0)*(height_cm/100.0),0), 1)) STORED,
    blood_type    VARCHAR(5),
    nhs_number    VARCHAR(20),
    gp_name       VARCHAR(200),
    gp_surgery    VARCHAR(200),
    gp_phone      VARCHAR(30),
    allergies     TEXT[],
    conditions    TEXT[],
    visibility    VARCHAR(10)  NOT NULL DEFAULT 'private'
                      CHECK (visibility IN ('private','partner','family')),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE health_profiles IS 'bmi is GENERATED (auto-computed from height_cm and weight_kg).';

-- [10.3] member_health_goals
CREATE TABLE member_health_goals (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID          NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    goal_type_id    SMALLINT      NOT NULL REFERENCES health_goal_types(id) ON DELETE CASCADE,
    target_value    NUMERIC(10,2) NOT NULL,
    current_value   NUMERIC(10,2),
    notes           TEXT,
    set_by          UUID          REFERENCES members(id) ON DELETE SET NULL,
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, goal_type_id)
);
COMMENT ON TABLE member_health_goals IS 'Upsert pattern. Falls back to health_goal_types.default_value if no row.';

-- [10.4] health_logs  (one per member per day)
CREATE TABLE health_logs (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    log_date        DATE         NOT NULL,
    calories_in     INT,
    calories_burned INT,
    water_ml        INT,
    steps           INT,
    sleep_minutes   INT,
    weight_kg       NUMERIC(5,1),
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, log_date)
);

-- [10.5] bp_logs  (multiple readings per day allowed)
CREATE TABLE bp_logs (
    id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID     NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    systolic    SMALLINT NOT NULL CHECK (systolic  BETWEEN 60 AND 250),
    diastolic   SMALLINT NOT NULL CHECK (diastolic BETWEEN 40 AND 150),
    pulse       SMALLINT          CHECK (pulse     BETWEEN 30 AND 250),
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [10.6] food_entries
CREATE TABLE food_entries (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    log_date    DATE         NOT NULL,
    meal_type   VARCHAR(15)  NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
    food_name   VARCHAR(255) NOT NULL,
    calories    INT,
    protein_g   NUMERIC(6,1),
    carbs_g     NUMERIC(6,1),
    fat_g       NUMERIC(6,1),
    quantity    NUMERIC(6,1) NOT NULL DEFAULT 1,
    unit        VARCHAR(30),
    barcode     VARCHAR(50),
    source      VARCHAR(20)  NOT NULL DEFAULT 'manual'
                    CHECK (source IN ('manual','barcode','nutritionix','ai')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- [10.7] medications
CREATE TABLE medications (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    dosage          VARCHAR(100),
    frequency       VARCHAR(50)  NOT NULL,
    times           TIME[],
    prescribed_by   VARCHAR(200),
    start_date      DATE,
    end_date        DATE,
    notes           TEXT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);
COMMENT ON TABLE medications IS 'times TIME[] drives medication_logs generation.';

-- [10.8] medication_logs  (FIX 1: member_id CASCADE added)
CREATE TABLE medication_logs (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id  UUID        NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    member_id      UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    scheduled_at   TIMESTAMPTZ NOT NULL,
    taken_at       TIMESTAMPTZ,
    status         VARCHAR(10) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('taken','skipped','pending')),
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE medication_logs IS 'FIX 1: member_id CASCADE added. Log has no meaning without its member.';

-- [10.9] workouts
CREATE TABLE workouts (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id        UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    workout_date     DATE         NOT NULL,
    type             VARCHAR(80)  NOT NULL,
    duration_minutes SMALLINT,
    distance_km      NUMERIC(6,2),
    calories_burned  INT,
    intensity        VARCHAR(10)  CHECK (intensity IN ('low','moderate','high')),
    notes            TEXT,
    source           VARCHAR(20)  NOT NULL DEFAULT 'manual'
                         CHECK (source IN ('manual','strava','garmin','apple_health')),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- [10.10] medical_appointments  (FIX 1: account_id CASCADE added)
CREATE TABLE medical_appointments (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id         UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    account_id        UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    title             VARCHAR(300) NOT NULL,
    type              VARCHAR(50)  NOT NULL DEFAULT 'gp'
                          CHECK (type IN ('gp','dentist','optician','hospital','physio','specialist','other')),
    provider          VARCHAR(200),
    location          VARCHAR(300),
    appointment_at    TIMESTAMPTZ,
    duration_minutes  SMALLINT,
    cost              NUMERIC(8,2),
    notes             TEXT,
    completed         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE medical_appointments IS 'FIX 1: account_id CASCADE added.';

-- ================================================================
--  BLOCK 11 — RECIPES & GROCERY  (4 tables)
-- ================================================================

-- [11.1] recipes  (FIX 3: created_by SET NULL)
CREATE TABLE recipes (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id           UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    created_by           UUID         REFERENCES members(id) ON DELETE SET NULL,
    title                VARCHAR(300) NOT NULL,
    description          TEXT,
    prep_minutes         SMALLINT,
    cook_minutes         SMALLINT,
    servings             SMALLINT,
    calories_per_serving INT,
    cuisine              VARCHAR(80),
    tags                 TEXT[],
    ingredients          JSONB        NOT NULL DEFAULT '[]',
    steps                JSONB        NOT NULL DEFAULT '[]',
    image_url            TEXT,
    source_url           TEXT,
    visibility           VARCHAR(10)  NOT NULL DEFAULT 'family'
                             CHECK (visibility IN ('private','partner','family')),
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at           TIMESTAMPTZ
);
COMMENT ON TABLE recipes IS 'FIX 3: created_by SET NULL. Recipe survives author removal.';

-- [11.2] meal_plans  (FIX 3: created_by SET NULL)
CREATE TABLE meal_plans (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id   UUID        NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    plan_date    DATE        NOT NULL,
    meal_type    VARCHAR(15) NOT NULL CHECK (meal_type IN ('breakfast','lunch','snack','dinner')),
    recipe_id    UUID        REFERENCES recipes(id) ON DELETE SET NULL,
    custom_meal  VARCHAR(300),
    servings     SMALLINT    NOT NULL DEFAULT 1,
    notes        TEXT,
    created_by   UUID        REFERENCES members(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [11.3] shopping_lists  (FIX 3: created_by SET NULL)
CREATE TABLE shopping_lists (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id       UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name             VARCHAR(150) NOT NULL DEFAULT 'Shopping',
    store            VARCHAR(150),
    planned_date     DATE,
    status           VARCHAR(15)  NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open','in_progress','completed')),
    ai_order_status  VARCHAR(20)  NOT NULL DEFAULT 'idle'
                         CHECK (ai_order_status IN ('idle','ready','placed','delivered')),
    order_reference  VARCHAR(100),
    created_by       UUID         REFERENCES members(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- [11.4] shopping_items  (FIX 2: checked_by SET NULL  |  FIX 3: added_by SET NULL)
CREATE TABLE shopping_items (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id         UUID         NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
    name            VARCHAR(300) NOT NULL,
    quantity        NUMERIC(6,1) NOT NULL DEFAULT 1,
    unit            VARCHAR(30),
    category        VARCHAR(80),
    checked         BOOLEAN      NOT NULL DEFAULT FALSE,
    checked_by      UUID         REFERENCES members(id) ON DELETE SET NULL,
    checked_at      TIMESTAMPTZ,
    added_by        UUID         REFERENCES members(id) ON DELETE SET NULL,
    from_recipe_id  UUID         REFERENCES recipes(id) ON DELETE SET NULL,
    notes           TEXT,
    sort_order      INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE shopping_items IS 'FIX 2: checked_by SET NULL. FIX 3: added_by SET NULL.';

-- ================================================================
--  BLOCK 12 — JOURNAL  (2 tables)
-- ================================================================

CREATE TABLE journal_entries (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id        UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    entry_date       DATE        NOT NULL,
    mood             VARCHAR(20),
    mood_score       SMALLINT    CHECK (mood_score BETWEEN 1 AND 5),
    happy_memory     TEXT,
    improvement_area TEXT,
    free_text        TEXT,
    tags             TEXT[],
    visibility       VARCHAR(10) NOT NULL DEFAULT 'private'
                         CHECK (visibility IN ('private','partner','family')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, entry_date)
);

CREATE TABLE journal_media (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id         UUID        NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    media_type       VARCHAR(10) NOT NULL CHECK (media_type IN ('photo','video','link')),
    url              TEXT        NOT NULL,
    thumbnail_url    TEXT,
    caption          VARCHAR(500),
    file_size_bytes  INT,
    duration_secs    INT,
    sort_order       SMALLINT    NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
--  BLOCK 13 — HOBBIES  (2 tables)
-- ================================================================

CREATE TABLE interests (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(10),
    category    VARCHAR(80),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, name)
);

CREATE TABLE feed_items (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id     UUID         NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    interest_id   UUID         REFERENCES interests(id) ON DELETE SET NULL,
    source        VARCHAR(100),
    external_id   VARCHAR(300),
    item_type     VARCHAR(20)  NOT NULL
                      CHECK (item_type IN ('article','video','event','recipe','product')),
    title         TEXT         NOT NULL,
    summary       TEXT,
    url           TEXT,
    image_url     TEXT,
    published_at  TIMESTAMPTZ,
    saved         BOOLEAN      NOT NULL DEFAULT FALSE,
    dismissed     BOOLEAN      NOT NULL DEFAULT FALSE,
    fetched_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, source, external_id)
);

-- ================================================================
--  BLOCK 14 — TRAVEL  (3 tables)
-- ================================================================

-- [14.1] trips  (FIX 3: created_by SET NULL  |  FIX 4: travellers removed)
CREATE TABLE trips (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id       UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    created_by       UUID         REFERENCES members(id) ON DELETE SET NULL,
    title            VARCHAR(300) NOT NULL,
    trip_type        VARCHAR(20)  NOT NULL DEFAULT 'holiday'
                         CHECK (trip_type IN ('holiday','weekend','day_trip','work')),
    destination      VARCHAR(300),
    country_code     CHAR(2),
    start_date       DATE,
    end_date         DATE,
    status           VARCHAR(20)  NOT NULL DEFAULT 'planning'
                         CHECK (status IN ('planning','booked','in_progress','completed','cancelled')),
    budget           NUMERIC(10,2),
    currency         CHAR(3)      NOT NULL DEFAULT 'GBP',
    cover_image_url  TEXT,
    notes            TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);
COMMENT ON TABLE trips IS 'FIX 3: created_by SET NULL. FIX 4: travellers UUID[] removed → trip_members.';

-- [14.2] trip_members  (junction — FIX 4)
-- Replaces trips.travellers UUID[]
-- trips ──< trip_members >── members
CREATE TABLE trip_members (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    member_id   UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_trip_member UNIQUE (trip_id, member_id)
);
COMMENT ON TABLE trip_members IS 'FIX 4: replaces trips.travellers UUID[].';

-- [14.3] trip_items
CREATE TABLE trip_items (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id          UUID         NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    item_type        VARCHAR(20)  NOT NULL
                         CHECK (item_type IN ('flight','hotel','car_hire','activity',
                                              'restaurant','transfer','insurance','other')),
    title            VARCHAR(300) NOT NULL,
    provider         VARCHAR(200),
    confirmation_ref VARCHAR(100),
    booked           BOOLEAN      NOT NULL DEFAULT FALSE,
    cost             NUMERIC(10,2),
    currency         CHAR(3)      NOT NULL DEFAULT 'GBP',
    starts_at        TIMESTAMPTZ,
    ends_at          TIMESTAMPTZ,
    location         VARCHAR(300),
    booking_url      TEXT,
    notes            TEXT,
    ai_suggested     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ================================================================
--  BLOCK 15 — PET CARE  (3 tables)
-- ================================================================

CREATE TABLE pets (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id        UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name              VARCHAR(100) NOT NULL,
    species           VARCHAR(50)  NOT NULL,
    breed             VARCHAR(100),
    colour            VARCHAR(80),
    date_of_birth     DATE,
    gender            VARCHAR(10)  CHECK (gender IN ('male','female','unknown')),
    microchip_number  VARCHAR(50),
    microchip_date    DATE,
    insurer           VARCHAR(150),
    policy_number     VARCHAR(100),
    vet_name          VARCHAR(200),
    vet_phone         VARCHAR(30),
    vet_address       TEXT,
    notes             TEXT,
    avatar_url        TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

CREATE TABLE pet_vaccinations (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id            UUID         NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    name              VARCHAR(200) NOT NULL,
    administered_date DATE,
    valid_until       DATE,
    administered_by   VARCHAR(200),
    batch_number      VARCHAR(100),
    notes             TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE pet_vaccinations IS 'valid_until drives expiry alerts.';

CREATE TABLE pet_vet_visits (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id          UUID         NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    visit_date      DATE         NOT NULL,
    reason          VARCHAR(300),
    diagnosis       TEXT,
    treatment       TEXT,
    cost            NUMERIC(8,2),
    vet_name        VARCHAR(200),
    follow_up_date  DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ================================================================
--  BLOCK 16 — INFRASTRUCTURE  (2 tables)
-- ================================================================

CREATE TABLE media_files (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id       UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    uploaded_by      UUID         REFERENCES members(id) ON DELETE SET NULL,
    s3_key           TEXT         NOT NULL UNIQUE,
    s3_bucket        VARCHAR(150) NOT NULL,
    file_name        VARCHAR(300),
    mime_type        VARCHAR(100),
    file_size_bytes  BIGINT,
    width_px         INT,
    height_px        INT,
    duration_secs    INT,
    purpose          VARCHAR(50),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id     UUID         REFERENCES accounts(id) ON DELETE SET NULL,
    user_id        UUID         REFERENCES users(id) ON DELETE SET NULL,
    member_id      UUID         REFERENCES members(id) ON DELETE SET NULL,
    action         VARCHAR(100) NOT NULL,
    resource_type  VARCHAR(80),
    resource_id    UUID,
    ip_address     INET,
    user_agent     TEXT,
    meta           JSONB,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE audit_logs IS 'Immutable. All FKs SET NULL: records survive entity deletion (GDPR).';

-- ================================================================
--  INDEXES
-- ================================================================

CREATE INDEX idx_users_account        ON users(account_id);
CREATE INDEX idx_users_cognito        ON users(cognito_sub);
CREATE INDEX idx_members_account      ON members(account_id);
CREATE INDEX idx_members_user         ON members(user_id);
CREATE INDEX idx_members_role         ON members(role_id);
CREATE INDEX idx_social_user          ON social_logins(user_id);
CREATE INDEX idx_role_perms_role      ON role_permissions(role_id);
CREATE INDEX idx_notif_member         ON notifications(member_id, read_at);
CREATE INDEX idx_briefing_cache       ON briefing_cache(member_id, cache_date);
CREATE INDEX idx_mnc_member           ON member_news_categories(member_id);
CREATE INDEX idx_mnc_category         ON member_news_categories(category_id);
CREATE INDEX idx_mns_member           ON member_news_sources(member_id);
CREATE INDEX idx_mns_source           ON member_news_sources(source_id);
CREATE INDEX idx_todo_items_active    ON todo_items(account_id, visibility, due_date)
                                          WHERE deleted_at IS NULL AND archived_at IS NULL;
CREATE INDEX idx_todo_items_assignee  ON todo_items(assigned_to_member_id) WHERE completed_at IS NULL;
CREATE INDEX idx_todo_items_due       ON todo_items(due_date)              WHERE completed_at IS NULL;
CREATE INDEX idx_todo_audit_item      ON todo_audit(todo_item_id);
CREATE INDEX idx_bills_account        ON bills(account_id)              WHERE deleted_at IS NULL;
CREATE INDEX idx_bills_due            ON bills(next_due_date)           WHERE active = TRUE;
CREATE INDEX idx_subs_account         ON subscriptions(account_id)      WHERE deleted_at IS NULL;
CREATE INDEX idx_subs_renewal         ON subscriptions(next_renewal)    WHERE active = TRUE;
CREATE INDEX idx_expenses_account     ON expenses(account_id, expense_date DESC);
CREATE INDEX idx_expenses_member      ON expenses(member_id, expense_date DESC);
CREATE INDEX idx_docs_account         ON documents(account_id)          WHERE deleted_at IS NULL;
CREATE INDEX idx_docs_expiry          ON documents(expiry_date)         WHERE deleted_at IS NULL;
CREATE INDEX idx_member_goals         ON member_health_goals(member_id);
CREATE INDEX idx_health_logs          ON health_logs(member_id, log_date DESC);
CREATE INDEX idx_bp_member            ON bp_logs(member_id, measured_at DESC);
CREATE INDEX idx_food_member          ON food_entries(member_id, log_date DESC);
CREATE INDEX idx_meds_member          ON medications(member_id)         WHERE deleted_at IS NULL;
CREATE INDEX idx_medlog_member        ON medication_logs(member_id, scheduled_at DESC);
CREATE INDEX idx_workouts_member      ON workouts(member_id, workout_date DESC);
CREATE INDEX idx_appts_member         ON medical_appointments(member_id, appointment_at);
CREATE INDEX idx_recipes_account      ON recipes(account_id)            WHERE deleted_at IS NULL;
CREATE INDEX idx_meal_plan            ON meal_plans(account_id, plan_date);
CREATE INDEX idx_shopping_items       ON shopping_items(list_id);
CREATE INDEX idx_journal_member       ON journal_entries(member_id, entry_date DESC);
CREATE INDEX idx_journal_media        ON journal_media(entry_id);
CREATE INDEX idx_interests_member     ON interests(member_id)           WHERE active = TRUE;
CREATE INDEX idx_feed_member          ON feed_items(member_id, fetched_at DESC) WHERE dismissed = FALSE;
CREATE INDEX idx_trips_account        ON trips(account_id, start_date)  WHERE deleted_at IS NULL;
CREATE INDEX idx_trip_members_trip    ON trip_members(trip_id);
CREATE INDEX idx_trip_members_member  ON trip_members(member_id);
CREATE INDEX idx_trip_items           ON trip_items(trip_id, starts_at);
CREATE INDEX idx_audit_account        ON audit_logs(account_id, created_at DESC);
CREATE INDEX idx_audit_user           ON audit_logs(user_id, created_at DESC);

-- ================================================================
--  AUTO-UPDATE updated_at TRIGGER
-- ================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'accounts','users','members',
    'account_settings','member_settings','briefing_settings',
    'todo_items',
    'bills','subscriptions','budgets','savings_goals','investments',
    'documents','notes','vehicles',
    'health_profiles','member_health_goals','health_logs',
    'medications','medical_appointments',
    'recipes','meal_plans','shopping_lists',
    'journal_entries','trips','trip_items','pets'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_upd BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()', tbl, tbl);
  END LOOP;
END $$;

-- ================================================================
--  VIEWS
-- ================================================================

-- V1: Today's agenda (overdue todos + pending medications)
CREATE OR REPLACE VIEW v_todays_agenda AS
    SELECT ti.account_id, ti.assigned_to_member_id AS member_id, m.display_name,
           'todo' AS item_type, ti.title, ti.due_date::TIMESTAMPTZ AS due_at,
           NULL::VARCHAR AS icon, NULL::VARCHAR AS color_hex, NULL::TEXT AS category
    FROM todo_items ti
    JOIN members m ON m.id = ti.assigned_to_member_id
    WHERE ti.due_date <= CURRENT_DATE
      AND ti.completed_at IS NULL
      AND ti.deleted_at IS NULL
      AND ti.archived_at IS NULL
UNION ALL
    SELECT m.account_id, ml.member_id, m.display_name,
           'medication', med.name || COALESCE(' ' || med.dosage,''),
           ml.scheduled_at, '💊', NULL, 'health'
    FROM medication_logs ml
    JOIN medications med ON med.id = ml.medication_id
    JOIN members m ON m.id = ml.member_id
    WHERE ml.scheduled_at::DATE = CURRENT_DATE AND ml.status = 'pending';

-- V2: Bills and subscriptions due within 14 days
CREATE OR REPLACE VIEW v_due_soon AS
    SELECT account_id, 'bill'::TEXT AS item_type, id, name, amount, currency,
           next_due_date AS due_date, (next_due_date - CURRENT_DATE) AS days_until_due,
           auto_pay, category
    FROM bills
    WHERE next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 14
      AND active = TRUE AND deleted_at IS NULL
UNION ALL
    SELECT account_id, 'subscription', id, name, amount, currency,
           next_renewal, (next_renewal - CURRENT_DATE), FALSE, category
    FROM subscriptions
    WHERE next_renewal BETWEEN CURRENT_DATE AND CURRENT_DATE + 14
      AND active = TRUE AND deleted_at IS NULL
ORDER BY due_date;

-- V3: Documents expiring within 6 months
CREATE OR REPLACE VIEW v_documents_expiring AS
    SELECT account_id, member_id, id, name, category,
           expiry_date, (expiry_date - CURRENT_DATE) AS days_until_expiry
    FROM documents
    WHERE expiry_date IS NOT NULL
      AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 180
      AND deleted_at IS NULL
    ORDER BY expiry_date;

-- V4: Monthly spend by category
CREATE OR REPLACE VIEW v_monthly_spend AS
    SELECT account_id, DATE_TRUNC('month', expense_date) AS month,
           category, SUM(amount) AS total_spent, COUNT(*) AS tx_count
    FROM expenses
    GROUP BY account_id, DATE_TRUNC('month', expense_date), category;

-- V5: Health summary with % of goal achieved
CREATE OR REPLACE VIEW v_health_summary AS
    SELECT hl.member_id, hl.log_date,
           hl.calories_in, hl.calories_burned, hl.water_ml, hl.steps, hl.sleep_minutes,
           COALESCE(g_cal.target_value, hgt_cal.default_value) AS calorie_goal,
           COALESCE(g_wat.target_value, hgt_wat.default_value) AS water_goal_ml,
           COALESCE(g_stp.target_value, hgt_stp.default_value) AS step_goal,
           ROUND(hl.calories_in::NUMERIC /
                 NULLIF(COALESCE(g_cal.target_value,hgt_cal.default_value),0)*100,1) AS calorie_pct,
           ROUND(hl.water_ml::NUMERIC /
                 NULLIF(COALESCE(g_wat.target_value,hgt_wat.default_value),0)*100,1) AS water_pct,
           ROUND(hl.steps::NUMERIC /
                 NULLIF(COALESCE(g_stp.target_value,hgt_stp.default_value),0)*100,1) AS steps_pct
    FROM health_logs hl
    LEFT JOIN health_goal_types hgt_cal ON hgt_cal.code = 'calories_in'
    LEFT JOIN member_health_goals g_cal
           ON g_cal.member_id = hl.member_id AND g_cal.goal_type_id = hgt_cal.id AND g_cal.active
    LEFT JOIN health_goal_types hgt_wat ON hgt_wat.code = 'water_intake'
    LEFT JOIN member_health_goals g_wat
           ON g_wat.member_id = hl.member_id AND g_wat.goal_type_id = hgt_wat.id AND g_wat.active
    LEFT JOIN health_goal_types hgt_stp ON hgt_stp.code = 'daily_steps'
    LEFT JOIN member_health_goals g_stp
           ON g_stp.member_id = hl.member_id AND g_stp.goal_type_id = hgt_stp.id AND g_stp.active;

-- V6: Role hierarchy (recursive CTE)
CREATE OR REPLACE VIEW v_role_hierarchy AS
WITH RECURSIVE tree AS (
    SELECT id, code, display_name, parent_role_id, 0 AS depth, code::TEXT AS path
    FROM member_roles WHERE parent_role_id IS NULL
    UNION ALL
    SELECT r.id, r.code, r.display_name, r.parent_role_id,
           t.depth + 1, t.path || ' → ' || r.code
    FROM member_roles r JOIN tree t ON t.id = r.parent_role_id
)
SELECT t.id, t.code, t.display_name, t.depth, t.path,
       ARRAY_AGG(rp.capability ORDER BY rp.capability) FILTER (WHERE rp.granted) AS granted_capabilities
FROM tree t
LEFT JOIN role_permissions rp ON rp.role_id = t.id
GROUP BY t.id, t.code, t.display_name, t.depth, t.path
ORDER BY t.depth, t.code;

-- V7: Member briefing config with expanded news selections
CREATE OR REPLACE VIEW v_member_briefing_config AS
SELECT bs.member_id, bs.home_postcode, bs.work_address, bs.school_address,
       bs.commute_mode, bs.email_provider, bs.show_on_this_day,
       COALESCE(ARRAY_AGG(nc.code ORDER BY mnc.sort_order)
           FILTER (WHERE nc.id IS NOT NULL), ARRAY[]::VARCHAR[]) AS news_category_codes,
       COALESCE(ARRAY_AGG(nc.api_param ORDER BY mnc.sort_order)
           FILTER (WHERE nc.api_param IS NOT NULL), ARRAY[]::VARCHAR[]) AS news_api_params,
       COALESCE(ARRAY_AGG(ns.api_id ORDER BY mns.sort_order)
           FILTER (WHERE ns.api_id IS NOT NULL), ARRAY[]::VARCHAR[]) AS news_source_api_ids
FROM briefing_settings bs
LEFT JOIN member_news_categories mnc ON mnc.member_id = bs.member_id
LEFT JOIN news_categories nc ON nc.id = mnc.category_id AND nc.is_active = TRUE
LEFT JOIN member_news_sources mns ON mns.member_id = bs.member_id
LEFT JOIN news_sources ns ON ns.id = mns.source_id AND ns.is_active = TRUE
GROUP BY bs.member_id, bs.home_postcode, bs.work_address,
         bs.school_address, bs.commute_mode, bs.email_provider, bs.show_on_this_day;

-- V8: Unused subscriptions (AI nudge: not used in 30+ days)
CREATE OR REPLACE VIEW v_unused_subscriptions AS
    SELECT account_id, id, name, category, amount, currency,
           last_used_at, (CURRENT_DATE - last_used_at) AS days_since_used, next_renewal
    FROM subscriptions
    WHERE active = TRUE AND last_used_at IS NOT NULL
      AND last_used_at < CURRENT_DATE - 30 AND deleted_at IS NULL
    ORDER BY days_since_used DESC;

-- ================================================================
--  ROW LEVEL SECURITY
-- ================================================================

CREATE ROLE mypal_app;

ALTER TABLE accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bp_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_items      ENABLE ROW LEVEL SECURITY;

-- Lambda sets: SET LOCAL app.member_id = '<uuid>' before every query
CREATE POLICY p_accounts ON accounts FOR ALL TO mypal_app
    USING (id = (SELECT account_id FROM members
                 WHERE id = current_setting('app.member_id')::UUID AND deleted_at IS NULL));

CREATE POLICY p_health_logs     ON health_logs     FOR ALL TO mypal_app USING (member_id = current_setting('app.member_id')::UUID);
CREATE POLICY p_bp_logs         ON bp_logs         FOR ALL TO mypal_app USING (member_id = current_setting('app.member_id')::UUID);
CREATE POLICY p_food_entries    ON food_entries     FOR ALL TO mypal_app USING (member_id = current_setting('app.member_id')::UUID);
CREATE POLICY p_medication_logs ON medication_logs  FOR ALL TO mypal_app USING (member_id = current_setting('app.member_id')::UUID);

CREATE POLICY p_journal ON journal_entries FOR ALL TO mypal_app
    USING (member_id = current_setting('app.member_id')::UUID
        OR (visibility = 'family' AND member_id IN (
               SELECT id FROM members WHERE account_id = (
                   SELECT account_id FROM members WHERE id = current_setting('app.member_id')::UUID))));

CREATE POLICY p_todo_items_all ON todo_items FOR ALL TO mypal_app
    USING (account_id = (SELECT account_id FROM members
                          WHERE id = current_setting('app.member_id', true)::UUID)
        AND (visibility = 'family'
             OR created_by_member_id = current_setting('app.member_id', true)::UUID));

COMMIT;
