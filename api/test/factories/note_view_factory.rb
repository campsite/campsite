# frozen_string_literal: true

FactoryBot.define do
  factory :note_view do
    association :note, factory: :note
    association :organization_membership
  end
end
