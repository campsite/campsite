# frozen_string_literal: true

FactoryBot.define do
  factory :integration_channel_member do
    integration_channel
    sequence(:provider_member_id) { |i| "provider-member-#{i}" }
  end
end
