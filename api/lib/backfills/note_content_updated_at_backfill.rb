# frozen_string_literal: true

module Backfills
  class NoteContentUpdatedAtBackfill
    def self.run(dry_run: true)
      notes = Note.where(content_updated_at: nil)
      count = notes.count

      if dry_run
        "Would have enqueued #{count} Note #{"record".pluralize(count)} for updating content_updated_at"
      else
        notes.find_each.with_index do |note, index|
          SetContentUpdatedAtJob.perform_in(index.seconds * 2, note.id)
        end

        "Enqueued #{count} Note #{"record".pluralize(count)} for updating content_updated_at"
      end
    end
  end
end
