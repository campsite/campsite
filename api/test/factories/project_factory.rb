# frozen_string_literal: true

FactoryBot.define do
  factory :project do
    organization
    call_room
    association :creator, factory: :organization_membership
    name { Faker::Hobby.activity }
    description { nil }

    trait :archived do
      archived_at { Time.current }
      association :archived_by, factory: :organization_membership
    end

    trait :private do
      private { true }
    end

    trait :general do
      is_default { true }
      is_general { true }
    end

    trait :default do
      is_default { true }
    end

    trait :chat_project do
      message_thread { association :message_thread, owner: creator }
    end
  end
end
