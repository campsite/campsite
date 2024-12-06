# frozen_string_literal: true

module Backfills
  class OrganizationsTrialEndsAtBackfill
    def self.run(dry_run: true)
      organizations = Organization.where(trial_ends_at: nil, plan_name: Plan::FREE_NAME)

      count = if dry_run
        organizations.count
      else
        organizations.update_all("trial_ends_at = DATE_ADD(created_at, INTERVAL 30 DAY)")
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} Organization #{"record".pluralize(count)}"
    end
  end
end
