# frozen_string_literal: true

FactoryBot.define do
  factory :tag do
    sequence(:name) { |i| "tag#{i}" }
    organization
  end
end
