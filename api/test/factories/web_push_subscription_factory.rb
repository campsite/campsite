# frozen_string_literal: true

FactoryBot.define do
  factory :web_push_subscription do
    user { association :user }
    endpoint { "https://example.com" }
    p256dh { "p256dh" }
    auth { "auth" }
  end
end
