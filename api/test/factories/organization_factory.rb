# frozen_string_literal: true

FactoryBot.define do
  factory :organization do
    association :creator, factory: :user
    name { Faker::Company.name }
    sequence(:slug) { |n| "org-#{n}" }
    email_domain { "campsite.com" }

    trait :billing_email do
      billing_email { "org-billing@example.com" }
    end

    trait :pro do
      plan_name { Plan::PRO_NAME }
    end
  end
end
