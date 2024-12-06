# frozen_string_literal: true

FactoryBot.define do
  factory :message do
    association :sender, factory: :organization_membership
    message_thread { association :message_thread, organization_memberships: [sender, create(:organization_membership, organization: sender.organization)] }
    content { "hello" }
  end

  trait :with_shared_post do
    shared_posts { [association(:post, organization: sender.organization)] }
  end

  trait :system do
    sender { nil }
    content { "This is a system message" }
  end
end
