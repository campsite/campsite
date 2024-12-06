# frozen_string_literal: true

FactoryBot.define do
  factory :organization_sso_domain do
    organization
    domain { "campsite.com" }
  end
end
