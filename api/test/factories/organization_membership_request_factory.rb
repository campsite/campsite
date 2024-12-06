# frozen_string_literal: true

FactoryBot.define do
  factory :organization_membership_request do
    user
    organization
  end
end
