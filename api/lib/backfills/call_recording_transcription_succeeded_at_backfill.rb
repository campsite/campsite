# frozen_string_literal: true

module Backfills
  class CallRecordingTranscriptionSucceededAtBackfill
    def self.run(dry_run: true)
      recordings = CallRecording.where(transcription_succeeded_at: nil).where.not(transcript_srt_file_path: nil)
      recordings_count = recordings.count
      recordings.update_all("transcription_succeeded_at = updated_at") unless dry_run
      "#{dry_run ? "Would have updated" : "Updated"} #{recordings_count} CallRecording #{"record".pluralize(recordings_count)}"
    end
  end
end
