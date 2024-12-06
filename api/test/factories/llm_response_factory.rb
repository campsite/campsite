# frozen_string_literal: true

FactoryBot.define do
  factory :llm_response do
    subject { association :post }
    invocation_key { "invocation_key" }
    prompt { "What should I have for breakfast?" }
    response { "Pancakes" }
  end
end
