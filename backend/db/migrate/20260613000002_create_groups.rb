# frozen_string_literal: true

# Named groups (access-control §8). Phase 1 only uses the HMG group; the Family
# group is virtual (resolved as account_id match, no rows). Sign-up creates an
# HMG group per account with the Owner as its first member (G-01).
class CreateGroups < ActiveRecord::Migration[7.2]
  def change
    create_table :groups, id: :uuid do |t|
      t.references :account, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.string   :type, null: false                       # 'hmg' (extensible)
      t.datetime :created_at, null: false, default: -> { "NOW()" }
    end
    add_index :groups, %i[account_id type], unique: true
    reversible do |dir|
      dir.up { execute "ALTER TABLE groups ADD CONSTRAINT chk_groups_type CHECK (type IN ('hmg'));" }
    end

    create_table :group_members, id: :uuid do |t|
      t.references :group,    type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.references :member,   type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      t.references :added_by, type: :uuid, foreign_key: { to_table: :members, on_delete: :nullify }
      t.datetime :added_at, null: false, default: -> { "NOW()" }
    end
    add_index :group_members, %i[group_id member_id], unique: true
  end
end
