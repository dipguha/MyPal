class Account < ApplicationRecord
  has_many :users,   dependent: :destroy
  has_many :members, dependent: :destroy
  has_many :groups,  dependent: :destroy
  has_one  :account_setting, dependent: :destroy

  validates :plan, inclusion: { in: %w[solo family] }

  def hmg_group
    groups.find_by(type: 'hmg')
  end
end
