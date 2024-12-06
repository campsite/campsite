# frozen_string_literal: true

module Backfills
  class NoteLastActivityAtBackfill
    def self.run(dry_run: true)
      notes = Note
        .where(last_activity_at: nil)
        .joins(
          <<~SQL.squish,
            LEFT JOIN (
              SELECT subject_id, MAX(created_at) AS max_created_at
              FROM comments
              WHERE comments.discarded_at IS NULL AND comments.subject_type = 'Note'
              GROUP BY subject_id
            ) latest_comments
            ON notes.id = latest_comments.subject_id
          SQL
        )

      count = if dry_run
        notes.count
      else
        notes.update_all("last_activity_at = null")
        notes.update_all("last_activity_at = GREATEST(COALESCE(latest_comments.max_created_at, notes.content_updated_at), notes.content_updated_at)")
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} Note #{"record".pluralize(count)}"
    end
  end
end
