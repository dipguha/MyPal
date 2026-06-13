# Seeds the canonical member_roles for the test DB (mirrors the reseed
# migration, whose INSERT is data and therefore not captured in schema.rb).
module SeedRoles
  ROLES = [
    [1, 'owner', 'Owner', nil, 1],
    [2, 'admin', 'Admin', 1, 2],
    [3, 'adult', 'Adult Member', 2, 3],
    [4, 'grandparent', 'Grandparent', 3, 4],
    [5, 'teenager', 'Teenager', 3, 5],
    [6, 'child', 'Children', 3, 6]
  ].freeze

  def self.call
    return if MemberRole.count == ROLES.length

    MemberRole.delete_all
    ROLES.each do |id, code, display_name, parent_role_id, sort_order|
      MemberRole.create!(id: id, code: code, display_name: display_name,
                         parent_role_id: parent_role_id, sort_order: sort_order)
    end
    ActiveRecord::Base.connection.execute("SELECT setval('member_roles_id_seq', 10)")
  end
end
