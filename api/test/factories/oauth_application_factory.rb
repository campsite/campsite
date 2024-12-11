# frozen_string_literal: true

FactoryBot.define do
  factory :oauth_application do
    sequence(:name) { |i| "oauth-app-#{i}" }
    redirect_uri  { "urn:ietf:wg:oauth:2.0:oob" }
    confidential  { true }
    association :owner, factory: :user

    trait :organization do
      association :owner, factory: :organization
    end

    trait :figma do
      name { "figma-plugin" }
      provider { :figma }
    end

    trait :zapier do
      name { "Zapier" }
      provider { :zapier }
      avatar_path { "static/avatars/service-zapier.png" }
      owner { nil }
      scopes { "read_organization write_organization" }
    end

    trait :cal_dot_com do
      name { "Cal.com" }
      provider { :cal_dot_com }
      owner { nil }
      scopes { "read_organization write_organization" }
    end

    trait :universal do
      owner { nil }
    end
  end
end
