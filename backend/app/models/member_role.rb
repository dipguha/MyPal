# Lookup table: role definitions + hierarchy. members.role_id → member_roles.id.
# Canonical codes: owner, admin, adult, grandparent, teenager, child.
class MemberRole < ApplicationRecord
  has_many :members, foreign_key: :role_id, inverse_of: :member_role, dependent: :restrict_with_exception
end
