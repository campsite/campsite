# frozen_string_literal: true

FactoryBot.define do
  factory :access_token do
    expires_in        { Doorkeeper.configuration.access_token_expires_in.to_i }
    refresh_token     { SecureRandom.hex(32) }
    use_refresh_token { false }
    scopes            { "read_organization write_organization" }

    association :resource_owner, factory: :user
    association :application, factory: [:oauth_application, :figma]

    trait :zapier do
      association :resource_owner, factory: :organization
      association :application, factory: [:oauth_application, :zapier]
      use_refresh_token { true }
    end

    trait :cal_dot_com do
      association :application, factory: [:oauth_application, :cal_dot_com]
      scopes { "read_organization read_user write_call_room" }
    end
  end
end
