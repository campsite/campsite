# frozen_string_literal: true

FactoryBot.define do
  factory :poll_option do
    poll
    description { "Option a" }
  end
end
