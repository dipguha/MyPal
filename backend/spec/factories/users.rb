FactoryBot.define do
  factory :user do
    account
    sequence(:cognito_sub) { |n| "cognito-sub-#{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    marketing_opt_in { false }
  end
end
