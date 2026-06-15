FactoryBot.define do
  factory :account do
    plan { 'family' }
    family_name { 'The Test Family' }

    trait :solo do
      plan { 'solo' }
    end
  end
end
