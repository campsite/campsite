# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    name { "Harry Potter" }
    password { SecureRandom.hex(User::PASSWORD_ENTROPY) }
    confirmed_at { Time.current }
    sequence(:username) { |n| "u#{n}" }
    sequence(:email) { |i| "user-#{i}@example.com" }

    trait :otp do
      otp_enabled { true }
      otp_secret { User.generate_otp_secret }
    end

    trait :unconfirmed do
      confirmed_at { nil }
    end

    trait :staff do
      staff { true }
    end

    trait :omniauth do
      omniauth_provider { "google_oauth2" }
      omniauth_uid { "123456789" }
    end

    trait :workos do
      workos_profile_id { "workos_profile_id" }
    end
  end
end
