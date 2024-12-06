# frozen_string_literal: true

FactoryBot.define do
  factory :notification do
    association :organization_membership
    association :event
    target { association :post, organization: organization_membership.organization }

    reason { "mention" }

    trait :read do
      read_at { 5.minutes.ago }
    end

    trait :discarded do
      discarded_at { 5.minutes.ago }
    end

    trait :archived do
      archived_at { 5.minutes.ago }
    end
  end
end
