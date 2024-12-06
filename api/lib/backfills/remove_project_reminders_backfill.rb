# frozen_string_literal: true

module Backfills
  class RemoveProjectRemindersBackfill
    def self.run(dry_run: true)
      deletables = ScheduledNotification.where(schedulable_type: "Project")

      deleted_count = if dry_run
        deletables.count
      else
        deletables.delete_all
      end

      "#{dry_run ? "Would have deleted" : "Deleted"} #{deleted_count} ScheduledNotification #{"record".pluralize(deleted_count)}"
    end
  end
end
