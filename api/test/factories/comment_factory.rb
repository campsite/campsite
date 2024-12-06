# frozen_string_literal: true

FactoryBot.define do
  factory :comment do
    subject { parent&.subject || create(:post) }
    member { association :organization_membership, organization: subject.organization }

    body_html { "<p>gimme some feedback</p>" }
  end

  trait :discarded do
    discarded_at { 1.hour.ago }
  end

  trait :from_integration do
    member { nil }
    integration { association :integration, :zapier, owner: subject.organization }
  end

  trait :from_oauth_application do
    member { nil }
    oauth_application { association :oauth_application, :zapier }
  end
end
