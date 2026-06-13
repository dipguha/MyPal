class GroupMember < ApplicationRecord
  belongs_to :group
  belongs_to :member
  belongs_to :added_by, class_name: 'Member', optional: true

  validates :member_id, uniqueness: { scope: :group_id }
end
