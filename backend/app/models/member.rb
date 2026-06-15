class Member < ApplicationRecord
  belongs_to :account
  belongs_to :user, optional: true
  belongs_to :member_role, foreign_key: :role_id, inverse_of: :members

  has_one  :member_setting, dependent: :destroy
  has_many :group_memberships, class_name: 'GroupMember', dependent: :destroy

  # member.role_code => 'owner' / 'admin' / ...
  delegate :code, to: :member_role, prefix: :role, allow_nil: true

  def owner? = role_code == 'owner'
  def admin? = role_code == 'admin'

  # Owner and Admin may invite and configure family members during onboarding.
  def can_manage_family? = owner? || admin?

  # True when this member belongs to their account's Household Managers Group.
  def is_hmg?
    group = account.hmg_group
    group ? GroupMember.exists?(group_id: group.id, member_id: id) : false
  end
end
