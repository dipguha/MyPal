# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_06_15_112044) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "account_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "currency", limit: 3, default: "GBP", null: false
    t.string "timezone", limit: 60, default: "Europe/London", null: false
    t.string "date_format", limit: 20, default: "DD/MM/YYYY", null: false
    t.integer "week_starts_on", default: 1, null: false
    t.jsonb "family_sharing", default: {}, null: false
    t.datetime "updated_at", default: -> { "now()" }, null: false
    t.index ["account_id"], name: "index_account_settings_on_account_id", unique: true
    t.check_constraint "week_starts_on >= 0 AND week_starts_on <= 6", name: "chk_week_starts_on"
  end

  create_table "accounts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "family_name", limit: 150
    t.string "plan", limit: 20, default: "solo", null: false
    t.datetime "plan_started_at"
    t.datetime "plan_expires_at"
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.datetime "updated_at", default: -> { "now()" }, null: false
    t.datetime "deleted_at"
    t.check_constraint "plan::text = ANY (ARRAY['solo'::character varying, 'family'::character varying]::text[])", name: "chk_accounts_plan"
  end

  create_table "group_members", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "group_id", null: false
    t.uuid "member_id", null: false
    t.uuid "added_by_id"
    t.datetime "added_at", default: -> { "now()" }, null: false
    t.index ["added_by_id"], name: "index_group_members_on_added_by_id"
    t.index ["group_id", "member_id"], name: "index_group_members_on_group_id_and_member_id", unique: true
    t.index ["group_id"], name: "index_group_members_on_group_id"
    t.index ["member_id"], name: "index_group_members_on_member_id"
  end

  create_table "groups", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "type", null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.index ["account_id", "type"], name: "index_groups_on_account_id_and_type", unique: true
    t.index ["account_id"], name: "index_groups_on_account_id"
    t.check_constraint "type::text = 'hmg'::text", name: "chk_groups_type"
  end

  create_table "member_roles", force: :cascade do |t|
    t.string "code", limit: 30, null: false
    t.string "display_name", limit: 100, null: false
    t.bigint "parent_role_id"
    t.text "description"
    t.boolean "is_active", default: true, null: false
    t.integer "sort_order", default: 0, null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.index ["code"], name: "index_member_roles_on_code", unique: true
  end

  create_table "member_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "member_id", null: false
    t.string "theme", limit: 10, default: "dark", null: false
    t.jsonb "notification_prefs", default: {"sms"=>true, "push"=>true, "email"=>true, "digest_time"=>"08:00"}, null: false
    t.jsonb "briefing_prefs", default: {"news"=>true, "email"=>true, "commute"=>true, "weather"=>true, "on_this_day"=>true, "school_commute"=>true}, null: false
    t.datetime "updated_at", default: -> { "now()" }, null: false
    t.string "home_postcode", limit: 10
    t.text "work_address"
    t.string "commute_mode", limit: 10
    t.string "news_topics", default: [], null: false, array: true
    t.string "interests", default: [], null: false, array: true
    t.index ["member_id"], name: "index_member_settings_on_member_id", unique: true
    t.check_constraint "commute_mode IS NULL OR (commute_mode::text = ANY (ARRAY['drive'::character varying, 'transit'::character varying, 'cycle'::character varying, 'walk'::character varying]::text[]))", name: "chk_member_settings_commute_mode"
    t.check_constraint "theme::text = ANY (ARRAY['dark'::character varying, 'light'::character varying]::text[])", name: "chk_theme"
  end

  create_table "members", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.uuid "user_id"
    t.bigint "role_id", null: false
    t.string "display_name", limit: 100, null: false
    t.string "first_name", limit: 80
    t.string "last_name", limit: 80
    t.date "date_of_birth"
    t.text "avatar_url"
    t.boolean "is_admin", default: false, null: false
    t.string "color_hex", limit: 7, default: "#6478f0", null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.datetime "updated_at", default: -> { "now()" }, null: false
    t.datetime "deleted_at"
    t.boolean "onboarding_complete", default: false, null: false
    t.index ["account_id"], name: "idx_members_account"
    t.index ["role_id"], name: "idx_members_role"
    t.index ["user_id"], name: "idx_members_user"
  end

  create_table "role_permissions", force: :cascade do |t|
    t.bigint "role_id", null: false
    t.string "capability", limit: 80, null: false
    t.boolean "granted", default: true, null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.index ["role_id", "capability"], name: "index_role_permissions_on_role_id_and_capability", unique: true
    t.index ["role_id"], name: "idx_role_perms_role"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "account_id", null: false
    t.string "cognito_sub", limit: 255, null: false
    t.citext "email"
    t.string "phone", limit: 30
    t.boolean "email_verified", default: false, null: false
    t.boolean "phone_verified", default: false, null: false
    t.datetime "last_login_at"
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.datetime "updated_at", default: -> { "now()" }, null: false
    t.datetime "deleted_at"
    t.boolean "marketing_opt_in", default: false, null: false
    t.index ["account_id"], name: "idx_users_account"
    t.index ["cognito_sub"], name: "idx_users_cognito", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "account_settings", "accounts", on_delete: :cascade
  add_foreign_key "group_members", "groups", on_delete: :cascade
  add_foreign_key "group_members", "members", column: "added_by_id", on_delete: :nullify
  add_foreign_key "group_members", "members", on_delete: :cascade
  add_foreign_key "groups", "accounts", on_delete: :cascade
  add_foreign_key "member_roles", "member_roles", column: "parent_role_id"
  add_foreign_key "member_settings", "members", on_delete: :cascade
  add_foreign_key "members", "accounts", on_delete: :cascade
  add_foreign_key "members", "member_roles", column: "role_id"
  add_foreign_key "members", "users", on_delete: :nullify
  add_foreign_key "role_permissions", "member_roles", column: "role_id", on_delete: :cascade
  add_foreign_key "users", "accounts", on_delete: :cascade
end
