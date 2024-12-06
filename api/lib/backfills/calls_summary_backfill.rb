# frozen_string_literal: true

module Backfills
  class CallsSummaryBackfill
    def self.run(dry_run: true)
      calls = Call
        .where(summary: nil)
        .joins(:recordings)
        .where.not({ recordings: { id: nil } })
        .eager_load(recordings: :summary_sections)
        .distinct

      count = if dry_run
        calls.count
      else
        updated = 0

        calls.find_each do |call|
          updated += 1
          call.update_columns(summary: call.recordings.first&.summary_html)
        end

        updated
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} Call #{"record".pluralize(count)}"
    end
  end
end
