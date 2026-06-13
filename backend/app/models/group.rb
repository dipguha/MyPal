class Group < ApplicationRecord
  # `type` is a real column (group type, e.g. 'hmg'), not Rails STI.
  self.inheritance_column = nil

  belongs_to :account
  has_many :group_members, dependent: :destroy
  has_many :members, through: :group_members

  validates :type, inclusion: { in: %w[hmg] }
end
