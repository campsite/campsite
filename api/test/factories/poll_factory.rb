# frozen_string_literal: true

FactoryBot.define do
  factory :poll do
    post
    description { "best platforms?" }

    trait :with_options do
      after(:create) do |poll|
        create(:poll_option, description: "option a", poll: poll)
        create(:poll_option, description: "option b", poll: poll)
      end
    end
  end
end
