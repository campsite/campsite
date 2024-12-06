# frozen_string_literal: true

FactoryBot.define do
  factory :organization_membership do
    initialize_with { OrganizationMembership.find_or_initialize_by(user: user, organization: organization) }
    user
    organization
    role_name { "admin" }

    trait :admin do
      role_name { "admin" }
    end

    trait :member do
      role_name { "member" }
    end

    trait :viewer do
      role_name { "viewer" }
    end

    trait :guest do
      role_name { "guest" }
    end

    trait :active do
      last_seen_at { Time.current }
    end

    trait :with_status do
      after(:create) do |member|
        create(:organization_membership_status, organization_membership: member)
      end
    end
  end
end
