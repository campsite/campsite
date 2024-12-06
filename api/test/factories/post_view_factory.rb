# frozen_string_literal: true

FactoryBot.define do
  factory :post_view do
    association :post, factory: :post
    association :member, factory: :organization_membership

    trait :read do
      read_at { Time.current }
    end
  end
end
