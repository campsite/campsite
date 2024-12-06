# frozen_string_literal: true

FactoryBot.define do
  factory :post_feedback_request do
    association :post, factory: :post
    member { association :organization_membership, organization: post.organization }
    has_replied { false }

    trait :dismissed do
      dismissed_at { Time.current }
    end
  end
end
