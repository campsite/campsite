# frozen_string_literal: true

FactoryBot.define do
  factory :message_thread_membership do
    association :message_thread
    organization_membership { association :organization_membership, organization: message_thread.owner.organization }
  end
end
