class MemberSetting < ApplicationRecord
  belongs_to :member

  # Onboarding Interests step caps selection at 5 (spec F-06).
  # news_topics / interests are Postgres text[]; Rails maps them to arrays.
  validates :interests, length: { maximum: 5 }
end
