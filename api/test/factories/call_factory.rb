# frozen_string_literal: true

FactoryBot.define do
  factory :call do
    room { project ? association(:call_room, organization: project.organization) : association(:call_room) }
    started_at { 5.minutes.ago }
    remote_session_id { Faker::Internet.uuid }

    trait :completed do
      stopped_at { 4.minutes.ago }
    end

    trait :recorded do
      after(:create) do |call|
        create(:call_recording, call: call)
      end
    end

    trait :in_subjectless_room do
      room { association(:call_room, subject: nil) }
    end

    trait :with_summary do
      summary { Faker::Lorem.paragraph }
    end

    # NOTE: This should be the last trait in the list so `reindex` is called
    # after all the other callbacks complete.
    trait :reindex do
      after(:create) do |call|
        call.reindex(refresh: true)
      end
    end
  end
end
