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

    trait :workos do
      workos_organization_id { "org_workos_id" }

      after(:create) do |organization|
        organization.update_setting(:enforce_sso_authentication, true)
      end
    end

    trait :pro do
      plan_name { Plan::PRO_NAME }
    end
  end
end
