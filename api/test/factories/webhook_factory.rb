# frozen_string_literal: true

FactoryBot.define do
  factory :webhook do
    creator { association :organization_membership }
    owner { association :oauth_application, owner: creator.organization }
    url { "https://example.com" }
    state { :enabled }
    secret { SecureRandom.hex(16) }
    event_types { [] }

    trait :disabled do
      state { :disabled }
    end

    trait :discarded do
      state { :disabled }
      discarded_at { Time.current }
    end
  end
end
