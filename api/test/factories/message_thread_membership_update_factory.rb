# frozen_string_literal: true

FactoryBot.define do
  factory :message_thread_membership_update do
    association :message_thread
    association :actor, factory: :organization_membership
  end
end
