# frozen_string_literal: true

FactoryBot.define do
  factory :webhook_delivery do
    webhook_event { association :webhook_event }
    status_code { 200 }
    delivered_at { Time.current }

    trait :failed do
      status_code { 400 }
    end
  end
end
