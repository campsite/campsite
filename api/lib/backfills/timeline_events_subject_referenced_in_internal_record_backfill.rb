# frozen_string_literal: true

module Backfills
  class TimelineEventsSubjectReferencedInInternalRecordBackfill
    def self.run(dry_run: true)
      scope = TimelineEvent.where(action: :post_referenced_in_internal_record)
      count = dry_run ? scope.count : scope.update_all(action: :subject_referenced_in_internal_record)

      "#{dry_run ? "Would have updated" : "Updated"} #{count} TimelineEvent #{"record".pluralize(count)}"
    end
  end
end
