# frozen_string_literal: true

FactoryBot.define do
  factory :event do
    association :subject, factory: :comment
    actor { subject.event_actor }
    association :organization

    action { "created" }
  end
end
