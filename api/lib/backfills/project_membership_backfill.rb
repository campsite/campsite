# frozen_string_literal: true

module Backfills
  class ProjectMembershipBackfill
    def self.run(dry_run: true)
      count = 0

      Permission.preload(subject: [{ organization: :memberships }, :project_memberships]).where(subject_type: "Project", discarded_at: nil).find_each do |permission|
        project = permission.subject
        organization = project.organization
        organization_membership = organization.memberships.find_by!(user: permission.user)
        project_membership = project.project_memberships.find_or_initialize_by(organization_membership: organization_membership)

        if project_membership.new_record? || project_membership.discarded?
          project_membership.update!(discarded_at: nil) unless dry_run
          count += 1
        end
      end

      "#{dry_run ? "Would have created" : "Created"} #{count} ProjectMembership #{"record".pluralize(count)}"
    end
  end
end
