# frozen_string_literal: true

FactoryBot.define do
  factory :bookmark do
    association :bookmarkable, factory: :project
    title { "github" }
    url { "https://example.com" }
  end
end
