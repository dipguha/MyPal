# frozen_string_literal: true

# Reseed member_roles to the canonical access-control role set.
# Baseline seeded: admin, partner, member, child, grandparent (no `owner`).
# Sign-up creates the first member as `owner`, so the role set must match the
# access-control spec (§8): owner, admin, adult, grandparent, teenager, child.
# Hierarchy preserved (ADR-001): owner → admin → adult → {grandparent, teenager, child}.
class ReseedMemberRoles < ActiveRecord::Migration[7.2]
  def up
    execute <<~SQL
      DELETE FROM member_roles;
      INSERT INTO member_roles (id, code, display_name, parent_role_id, sort_order) VALUES
        (1, 'owner',       'Owner',        NULL, 1),
        (2, 'admin',       'Admin',        1,    2),
        (3, 'adult',       'Adult Member', 2,    3),
        (4, 'grandparent', 'Grandparent',  3,    4),
        (5, 'teenager',    'Teenager',     3,    5),
        (6, 'child',       'Children',     3,    6);
      SELECT setval('member_roles_id_seq', 10);
    SQL
  end

  def down
    execute <<~SQL
      DELETE FROM member_roles;
      INSERT INTO member_roles (id, code, display_name, parent_role_id, sort_order) VALUES
        (1, 'admin',       'Admin',       NULL, 1),
        (2, 'partner',     'Partner',     1,    2),
        (3, 'member',      'Member',      2,    3),
        (4, 'child',       'Child',       3,    4),
        (5, 'grandparent', 'Grandparent', 3,    5);
      SELECT setval('member_roles_id_seq', 10);
    SQL
  end
end
