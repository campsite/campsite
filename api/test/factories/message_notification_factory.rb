# frozen_string_literal: true

FactoryBot.define do
  factory :message_notification do
    message
    message_thread_membership

    transient do
      organization_membership { nil }
    end

    after(:create) do |message_notification, evaluator|
      if evaluator.organization_membership
        message_thread = create(
          :message_thread,
          owner: evaluator.organization_membership,
          organization_memberships: [evaluator.organization_membership, create(:organization_membership, organization: evaluator.organization_membership.organization)],
        )
        message = create(:message, message_thread: message_thread)

        message_notification.update!(
          message: message,
          message_thread_membership: message_thread.memberships.find_by!(organization_membership: evaluator.organization_membership),
        )
      end
    end
  end
end
