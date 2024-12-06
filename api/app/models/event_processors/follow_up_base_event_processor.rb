# frozen_string_literal: true

module EventProcessors
  class FollowUpBaseEventProcessor < BaseEventProcessor
    alias_method :follow_up, :subject

    private

    def create_notification!
      return if event.skip_notifications? || !Pundit.policy!(follow_up.organization_membership.user, follow_up.subject).show?

      notification = event.notifications.create!(
        reason: :follow_up,
        organization_membership: follow_up.organization_membership,
        target: follow_up.notification_target,
      )

      notification.deliver_email_later
      notification.deliver_slack_message_later
      notification.deliver_web_push_notification_later
    end
  end
end
