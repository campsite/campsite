# frozen_string_literal: true

FactoryBot.define do
  factory :timeline_event do
    association :subject, factory: :post
    actor { nil }

    action { "subject_pinned" }
  end
end
