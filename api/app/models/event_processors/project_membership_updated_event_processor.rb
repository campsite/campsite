# frozen_string_literal: true

module EventProcessors
  class ProjectMembershipUpdatedEventProcessor < ProjectMembershipBaseEventProcessor
    def process!
      return unless subject_restored?

      notify_organization_membership
      trigger_project_memberships_stale_event
    end
  end
end
