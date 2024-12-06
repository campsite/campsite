# frozen_string_literal: true

FactoryBot.define do
  factory :custom_reaction do
    file_type { "image/jpeg" }
    file_path { "/path/to/image.png" }
    sequence(:name) { |i| "blob-#{i}" }

    association :organization
    association :creator, factory: :organization_membership
  end
end
