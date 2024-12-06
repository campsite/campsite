# frozen_string_literal: true

FactoryBot.define do
  factory :post_digest do
    organization
    creator { association :organization_membership, organization: organization }
    title { Faker::Lorem.name }
  end
end
