class User < ApplicationRecord
  belongs_to :account
  has_one :member, dependent: :nullify

  validates :cognito_sub, presence: true, uniqueness: true
  validates :email, uniqueness: true, allow_nil: true
end
