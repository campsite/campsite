# frozen_string_literal: true

FactoryBot.define do
  factory :integration_channel do
    integration
    name { Faker::Hobby.activity }
    sequence(:provider_channel_id) { |i| "provider-channel-#{i}" }
  end
end
