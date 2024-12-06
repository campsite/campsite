# frozen_string_literal: true

FactoryBot.define do
  factory :note do
    member { association :organization_membership }
    title { "Cool new note" }
    description_html { "<p>Hey there</p>" }

    trait :discarded do
      discarded_at { 5.minutes.ago }
    end

    # NOTE: This should be the last trait in the list so `reindex` is called
    # after all the other callbacks complete.
    trait :reindex do
      after(:create) do |record|
        record.reindex(refresh: true)
      end
    end
  end
end
