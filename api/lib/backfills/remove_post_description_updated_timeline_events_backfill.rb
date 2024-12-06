# frozen_string_literal: true

module Backfills
  class RemovePostDescriptionUpdatedTimelineEventsBackfill
    def self.run(dry_run: true)
      timeline_events_to_delete = TimelineEvent.where(action: :post_description_updated)

      deleted_count = if dry_run
        timeline_events_to_delete.count
      else
        timeline_events_to_delete.delete_all
      end

      "#{dry_run ? "Would have deleted" : "Deleted"} #{deleted_count} TimelineEvent #{"record".pluralize(deleted_count)}"
    end
  end
end
