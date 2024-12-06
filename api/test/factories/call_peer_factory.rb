# frozen_string_literal: true

FactoryBot.define do
  factory :call_peer do
    organization_membership
    user { organization_membership&.user }
    call
    name { "John Doe" }
    remote_peer_id { Faker::Internet.uuid }
    joined_at { 5.minutes.ago }
    left_at { 4.minutes.ago }

    trait :active do
      left_at { nil }
    end
  end
end
