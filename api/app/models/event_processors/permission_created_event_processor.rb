# frozen_string_literal: true

module EventProcessors
  class PermissionCreatedEventProcessor < PermissionBaseEventProcessor
    def process!
      return unless permission.subject.is_a?(Note)
      return if event.actor == organization_membership

      notification = event.notifications.create!(
        reason: :permission_granted,
        organization_membership: organization_membership,
        target: permission.subject,
        target_scope: :permission,
      )

      permission.subject.subscriptions.create_or_find_by(user: user)

      notification.deliver_email_later
      notification.deliver_slack_message_later
      notification.deliver_web_push_notification_later

      notified_user_ids.add(user.id)

      trigger_permissions_stale_event
    end
  end
end
