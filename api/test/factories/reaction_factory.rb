# frozen_string_literal: true

FactoryBot.define do
  factory :reaction do
    association :subject, factory: :post
    member { association :organization_membership, organization: subject.organization }
    content { "🔥" }

    trait :custom_content do
      content { nil }
      association :custom_content, factory: :custom_reaction
    end

    trait :discarded do
      discarded_at { Time.current }
    end
  end
end
