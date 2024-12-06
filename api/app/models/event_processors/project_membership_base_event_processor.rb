# frozen_string_literal: true

module EventProcessors
  class ProjectMembershipBaseEventProcessor < BaseEventProcessor
    alias_method :project_membership, :subject
    delegate :organization_membership, :user, :project, :trigger_project_memberships_stale_event, :oauth_application, to: :project_membership

    def notify_organization_membership
      return if !event.named_actor? || event.actor == organization_membership || event.skip_notifications? || oauth_application.present?

      notification = event.notifications.create!(
        reason: :added,
        organization_membership: organization_membership,
        target: project,
      )

      notification.deliver_email_later
      notification.deliver_slack_message_later
      notification.deliver_web_push_notification_later

      notified_user_ids.add(user.id)
    end
  end
end
