# frozen_string_literal: true

FactoryBot.define do
  factory :organization_membership_status do
    organization_membership
    message { "OoO" }
    emoji { "🌴" }
  end
end
