FactoryBot.define do
  factory :member do
    account
    user { association :user, account: account }
    role_id { 1 } # owner
    display_name { 'Sarah' }
    first_name { 'Sarah' }
    last_name { 'Smith' }
    is_admin { true }
    onboarding_complete { false }

    trait :admin do
      role_id { 2 }
    end

    trait :adult do
      role_id { 3 }
      is_admin { false }
    end

    trait :grandparent do
      role_id { 4 }
      is_admin { false }
    end

    trait :teenager do
      role_id { 5 }
      is_admin { false }
    end

    trait :child do
      role_id { 6 }
      is_admin { false }
      user { nil }
    end
  end
end
