# frozen_string_literal: true

FactoryBot.define do
  factory :follow_up do
    association :subject, factory: :post
    organization_membership { association :organization_membership, organization: subject.organization }
    show_at { 1.hour.from_now }

    trait :shown do
      show_at { 1.hour.ago }
      shown_at { 1.hour.ago }
    end
  end
end
