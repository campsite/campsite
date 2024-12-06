# frozen_string_literal: true

module Backfills
  class DeactivatedMemberProjectMembershipsBackfill
    def self.run(dry_run: true)
      remove_member_count = 0

      OrganizationMembership.discarded.each do |organization_membership|
        organization_membership.project_memberships.each do |project_membership|
          project_membership.project.remove_member!(organization_membership) unless dry_run
          remove_member_count += 1
        end
      end

      "#{dry_run ? "Would have removed" : "Removed"} #{remove_member_count} project #{"membership".pluralize(remove_member_count)} from deactivated members"
    end
  end
end
