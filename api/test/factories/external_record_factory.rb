# frozen_string_literal: true

FactoryBot.define do
  factory :external_record do
    remote_record_id { SecureRandom.uuid }
    remote_record_title { "Title" }
    service { 0 }
  end

  trait :linear_issue do
    metadata do
      {
        url: "https://linear.app/test/issue/123",
        type: "Issue",
        identifier: "123",
        state: {
          name: "Triage",
          type: "triage",
          color: "#000000",
        },
      }
    end
  end
end
