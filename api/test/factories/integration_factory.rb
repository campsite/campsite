# frozen_string_literal: true

FactoryBot.define do
  factory :integration do
    association :creator, factory: :user
    owner { create(:organization) }
    provider { "slack" }
    token { "some-token" }

    trait :linear do
      provider { "linear" }
      token { Rails.application.credentials&.dig(:linear, :token) }
    end

    trait :slack do
      provider { "slack" }
    end

    trait :zapier do
      provider { "zapier" }
      token { "zapier-token" }
    end

    trait :campsite do
      provider { "campsite" }
    end
  end
end
