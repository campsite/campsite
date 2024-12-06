# frozen_string_literal: true

module EventProcessors
  class ProjectUpdatedEventProcessor < ProjectBaseEventProcessor
    def process!
      if update_archived_project?
        notify_members_of_archival
      elsif update_unarchived_project?
        project.notifications.subject_archived.discard_all
        project.notifications.subject_archived.each(&:delete_slack_message_later)
      end
    end

    private

    def update_archived_project?
      subject_previous_changes[:archived_at].present? &&
        subject_previous_changes[:archived_at].first.nil? &&
        subject_previous_changes[:archived_at].second.present? &&
        project.archived?
    end

    def update_unarchived_project?
      subject_previous_changes[:archived_at].present? &&
        subject_previous_changes[:archived_at].first.present? &&
        subject_previous_changes[:archived_at].second.nil? &&
        !project.archived?
    end

    def notify_members_of_archival
      kept_project_memberships.each do |project_membership|
        organization_membership = project_membership.organization_membership
        next if !organization_membership || event.actor == organization_membership

        notification = event.notifications.create!(
          reason: :subject_archived,
          organization_membership: organization_membership,
          target: project,
        )

        notification.deliver_email_later
        notification.deliver_slack_message_later
        notification.deliver_web_push_notification_later

        notified_user_ids.add(organization_membership.user.id)
      end
    end
  end
end
