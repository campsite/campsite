# frozen_string_literal: true

module EventProcessors
  class ProjectMembershipDestroyedEventProcessor < ProjectMembershipBaseEventProcessor
    def process!
      project_membership.notifications.discard_all
      project_membership.notifications.each(&:delete_slack_message_later)
      trigger_project_memberships_stale_event

      if project.private?
        project_membership.organization_membership.kept_notifications.where(target: project.posts + project.notes + project.calls).each do |notification|
          next if Pundit.policy!(user, notification.target).show?

          notification.discard!
        end
      end
    end
  end
end
