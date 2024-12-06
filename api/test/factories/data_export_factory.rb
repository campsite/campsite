# frozen_string_literal: true

FactoryBot.define do
  factory :data_export do
    subject { association :organization }
    member { association :organization_membership, organization: subject }

    trait :completed do
      status { :completed }
      completed_at { Time.current }
    end
  end
end
