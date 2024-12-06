# frozen_string_literal: true

class SetContentUpdatedAtJob < BaseJob
  sidekiq_options queue: "backfill", retry: 3

  def perform(note_id)
    note = Note.find(note_id)
    allowlisted_fields = [:title, :description_html, :project_id, :visibility, :project_permission]

    content_updated_at = Event.where(subject: note)
      .where("JSON_CONTAINS_PATH(metadata, 'one', '$.subject_previous_changes')")
      .where("JSON_OVERLAPS(JSON_KEYS(metadata->'$.subject_previous_changes'), CAST(? AS JSON))", allowlisted_fields.to_json)
      .order(id: :desc)
      .limit(1)
      &.first
      &.created_at

    note.update(content_updated_at: content_updated_at || note.created_at)
  end
end
