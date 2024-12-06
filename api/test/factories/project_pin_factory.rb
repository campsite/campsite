# frozen_string_literal: true

FactoryBot.define do
  factory :project_pin do
    subject { create(:post) }
    pinner { association :organization_membership, organization: subject.organization }
    project { subject.project }

    trait :discarded do
      discarded_at { Time.current }
    end
  end
end
