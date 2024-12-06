# frozen_string_literal: true

module Backfills
  class TimelineEventsPublicIdBackfill
    def self.run(dry_run: true)
      timeline_events = TimelineEvent.where(public_id: nil)

      count = if dry_run
        timeline_events.count
      else
        result = 0

        timeline_events.find_each do |timeline_event|
          timeline_event.update_columns(public_id: TimelineEvent.generate_public_id)
          result += 1
        end

        result
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} TimelineEvent #{"record".pluralize(count)}"
    end
  end
end
