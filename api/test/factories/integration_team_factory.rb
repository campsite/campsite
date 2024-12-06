# frozen_string_literal: true

FactoryBot.define do
  factory :integration_team do
    integration
    name { Faker::Hobby.activity }
    sequence(:provider_team_id) { |i| "provider-team-#{i}" }
  end
end
