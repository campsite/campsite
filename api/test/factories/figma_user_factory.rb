# frozen_string_literal: true

FactoryBot.define do
  factory :figma_user do
    user
    id { SecureRandom.uuid }
    handle { Faker::Internet.username }
    img_url { Faker::Internet.url }
    email { Faker::Internet.email }
  end
end
