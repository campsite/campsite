# frozen_string_literal: true

module EventProcessors
  class ProjectMembershipCreatedEventProcessor < ProjectMembershipBaseEventProcessor
    def process!
      notify_organization_membership
      trigger_project_memberships_stale_event
    end
  end
end
