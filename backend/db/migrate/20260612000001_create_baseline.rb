# frozen_string_literal: true

# Migration: Baseline schema
#
# Creates the 7 tables required for sign-up, sign-in, access control,
# and the onboarding journey. All other tables are added per-feature.
#
# Tables created:
#   member_roles      — lookup: role hierarchy (admin → partner → member → child/grandparent)
#   role_permissions  — capability flags per role
#   accounts          — top-level tenant (plan: 'solo' | 'family')
#   users             — auth identity (cognito_sub)
#   members           — household members (profile; children may have no user row)
#   account_settings  — per-account preferences (currency, timezone, etc.)
#   member_settings   — per-member preferences (theme, notifications, briefing)
#
# Tables NOT included (intentionally omitted):
#   account_types   — removed; plan enum on accounts is the single source of truth (ADR-003)
#   social_logins   — removed; Cognito handles OAuth connections (ADR-003)
#   audit_logs      — deferred to platform--access-control migration
#   notifications   — deferred to notifications feature
#   All other feature tables deferred to their own migrations

class CreateBaseline < ActiveRecord::Migration[7.2]
  def up
    enable_extension "citext"    # case-insensitive text (email columns)
    enable_extension "pgcrypto"  # gen_random_uuid() on older PG; no-op on PG 13+

    # ----------------------------------------------------------------
    # 1. member_roles — lookup table; seeds included
    # ----------------------------------------------------------------
    create_table :member_roles do |t|
      t.string  :code,           limit: 30,  null: false
      t.string  :display_name,   limit: 100, null: false
      t.bigint  :parent_role_id             # self-referential FK added after table exists
      t.text    :description
      t.boolean :is_active,                 null: false, default: true
      t.integer :sort_order,                null: false, default: 0
      t.datetime :created_at,               null: false, default: -> { "NOW()" }
    end
    add_index :member_roles, :code, unique: true
    # Self-referential FK: role hierarchy (admin → partner → member → child/grandparent)
    add_foreign_key :member_roles, :member_roles, column: :parent_role_id

    # Seed role hierarchy — required for members.role_id FK to resolve
    execute <<~SQL
      INSERT INTO member_roles (id, code, display_name, parent_role_id, sort_order) VALUES
        (1, 'admin',       'Admin',       NULL, 1),
        (2, 'partner',     'Partner',     1,    2),
        (3, 'member',      'Member',      2,    3),
        (4, 'child',       'Child',       3,    4),
        (5, 'grandparent', 'Grandparent', 3,    5);
      SELECT setval('member_roles_id_seq', 10);
    SQL

    # ----------------------------------------------------------------
    # 2. role_permissions — capability flags per role
    # ----------------------------------------------------------------
    create_table :role_permissions do |t|
      t.bigint  :role_id,    null: false
      t.string  :capability, limit: 80, null: false
      t.boolean :granted,               null: false, default: true
      t.datetime :created_at,           null: false, default: -> { "NOW()" }
    end
    add_index :role_permissions, :role_id, name: "idx_role_perms_role"
    add_index :role_permissions, %i[role_id capability], unique: true
    add_foreign_key :role_permissions, :member_roles, column: :role_id, on_delete: :cascade

    # ----------------------------------------------------------------
    # 3. accounts — top-level tenant
    #    plan: 'solo' (Individual, £2.99/mo) | 'family' (Family, £4.99/mo)
    #    Note: no account_type_id — account_types table removed (ADR-003)
    # ----------------------------------------------------------------
    create_table :accounts, id: :uuid do |t|
      t.string   :family_name,    limit: 150
      t.string   :plan,           limit: 20, null: false, default: "solo"
      t.datetime :plan_started_at
      t.datetime :plan_expires_at
      t.datetime :created_at,                null: false, default: -> { "NOW()" }
      t.datetime :updated_at,                null: false, default: -> { "NOW()" }
      t.datetime :deleted_at
    end
    execute "ALTER TABLE accounts ADD CONSTRAINT chk_accounts_plan CHECK (plan IN ('solo','family'));"

    # ----------------------------------------------------------------
    # 4. users — auth identity; one per person who can log in
    # ----------------------------------------------------------------
    create_table :users, id: :uuid do |t|
      t.references :account,      type: :uuid, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.string     :cognito_sub,  limit: 255, null: false
      t.column     :email,        :citext
      t.string     :phone,        limit: 30
      t.boolean    :email_verified,           null: false, default: false
      t.boolean    :phone_verified,           null: false, default: false
      t.datetime   :last_login_at
      t.datetime   :created_at,               null: false, default: -> { "NOW()" }
      t.datetime   :updated_at,               null: false, default: -> { "NOW()" }
      t.datetime   :deleted_at
    end
    add_index :users, :account_id,  name: "idx_users_account"
    add_index :users, :cognito_sub, unique: true, name: "idx_users_cognito"
    add_index :users, :email,       unique: true

    # ----------------------------------------------------------------
    # 5. members — household members (profile layer)
    #    user_id is nullable: children have a members row but no users row
    # ----------------------------------------------------------------
    create_table :members, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.references :user,    type: :uuid,              foreign_key: { on_delete: :nullify }, index: false
      t.bigint     :role_id,              null: false
      t.string     :display_name, limit: 100, null: false
      t.string     :first_name,   limit: 80
      t.string     :last_name,    limit: 80
      t.date       :date_of_birth
      t.text       :avatar_url
      t.boolean    :is_admin,             null: false, default: false
      t.string     :color_hex,    limit: 7,  null: false, default: "#6478f0"
      t.datetime   :created_at,           null: false, default: -> { "NOW()" }
      t.datetime   :updated_at,           null: false, default: -> { "NOW()" }
      t.datetime   :deleted_at
    end
    add_foreign_key :members, :member_roles, column: :role_id
    add_index :members, :account_id, name: "idx_members_account"
    add_index :members, :user_id,    name: "idx_members_user"
    add_index :members, :role_id,    name: "idx_members_role"

    # ----------------------------------------------------------------
    # 6. account_settings — one per account; created during onboarding
    # ----------------------------------------------------------------
    create_table :account_settings, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.string  :currency,       limit: 3,  null: false, default: "GBP"
      t.string  :timezone,       limit: 60, null: false, default: "Europe/London"
      t.string  :date_format,    limit: 20, null: false, default: "DD/MM/YYYY"
      t.integer :week_starts_on,            null: false, default: 1
      t.jsonb   :family_sharing,            null: false, default: {}
      t.datetime :updated_at,               null: false, default: -> { "NOW()" }
    end
    add_index :account_settings, :account_id, unique: true
    execute "ALTER TABLE account_settings ADD CONSTRAINT chk_week_starts_on CHECK (week_starts_on BETWEEN 0 AND 6);"

    # ----------------------------------------------------------------
    # 7. member_settings — one per member; created at sign-up
    # ----------------------------------------------------------------
    create_table :member_settings, id: :uuid do |t|
      t.references :member, type: :uuid, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.string  :theme, limit: 10, null: false, default: "dark"
      t.jsonb   :notification_prefs, null: false,
                default: { "email" => true, "sms" => true, "push" => true, "digest_time" => "08:00" }
      t.jsonb   :briefing_prefs, null: false,
                default: { "weather" => true, "commute" => true, "school_commute" => true,
                           "news" => true, "email" => true, "on_this_day" => true }
      t.datetime :updated_at, null: false, default: -> { "NOW()" }
    end
    add_index :member_settings, :member_id, unique: true
    execute "ALTER TABLE member_settings ADD CONSTRAINT chk_theme CHECK (theme IN ('dark','light'));"
  end

  def down
    drop_table :member_settings
    drop_table :account_settings
    drop_table :members
    drop_table :users
    drop_table :accounts
    drop_table :role_permissions
    drop_table :member_roles
    disable_extension "citext"
    disable_extension "pgcrypto"
  end
end
