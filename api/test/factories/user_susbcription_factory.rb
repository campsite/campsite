# frozen_string_literal: true

FactoryBot.define do
  factory :user_subscription do
    user
    association :subscribable, factory: :post
  end
end
