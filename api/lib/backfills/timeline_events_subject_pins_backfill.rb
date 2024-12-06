# frozen_string_literal: true

module Backfills
  class TimelineEventsSubjectPinsBackfill
    def self.run(dry_run: true)
      pinned_scope = TimelineEvent.where(action: :post_pinned)
      unpinned_scope = TimelineEvent.where(action: :post_unpinned)

      pinned_count = dry_run ? pinned_scope.count : pinned_scope.update_all(action: :subject_pinned)
      unpinned_count = dry_run ? unpinned_scope.count : unpinned_scope.update_all(action: :subject_unpinned)

      total_count = pinned_count + unpinned_count
      "#{dry_run ? "Would have updated" : "Updated"} #{total_count} TimelineEvent #{"record".pluralize(total_count)} (#{pinned_count} pinned, #{unpinned_count} unpinned)"
    end
  end
end
