# frozen_string_literal: true

module EventProcessors
  class CallBaseEventProcessor < BaseEventProcessor
    alias_method :call, :subject

    private

    def create_notification!(reason:, organization_membership:)
      user = organization_membership.user
      return if event.skip_notifications?
      return unless Pundit.policy!(user, call).show?
      return if notified_user_ids.include?(user.id)

      notification = event.notifications.create!(
        reason: reason,
        organization_membership: organization_membership,
        target: call,
      )

      notification.deliver_email_later
      notification.deliver_slack_message_later
      notification.deliver_web_push_notification_later

      notified_user_ids.add(user.id)
    end
  end
end
