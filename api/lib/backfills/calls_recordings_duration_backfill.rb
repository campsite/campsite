# frozen_string_literal: true

module Backfills
  class CallsRecordingsDurationBackfill
    def self.run(dry_run: true)
      calls = Call
        .where(recordings_duration: 0)
        .joins(:recordings)
        .where.not({ recordings: { id: nil } })
        .eager_load(:recordings)
        .distinct

      count = if dry_run
        calls.count
      else
        calls.find_each do |call|
          call.update_columns(recordings_duration: call.recordings.sum(&:duration_in_seconds) || 0)
        end
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} Call #{"record".pluralize(count)}"
    end
  end
end
