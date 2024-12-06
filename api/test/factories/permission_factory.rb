# frozen_string_literal: true

FactoryBot.define do
  factory :permission do
    user
    association :subject, factory: :note
    action { :view }
    event_actor { association :organization_membership, organization: subject.organization }
  end
end
