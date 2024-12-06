# frozen_string_literal: true

FactoryBot.define do
  factory :scheduled_subscription_invoice do
    association :organization, :stripe_customer
    stripe_subscription_id { "sub_foobarbaz" }
    scheduled_for { 1.week.from_now }

    trait :due do
      scheduled_for { 1.hour.ago }
      payment_attempted_at { nil }
    end

    trait :not_due do
      scheduled_for { 1.week.from_now }
      payment_attempted_at { nil }
    end

    trait :payment_attempted do
      scheduled_for { 1.hour.ago }
      payment_attempted_at { 1.hour.ago }
    end
  end
end
