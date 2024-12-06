# frozen_string_literal: true

module HmsEvents
  class HandleTranscriptionFailureJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = TranscriptionFailureEvent.new(JSON.parse(payload))
      recording = CallRecording.find_by(remote_transcription_id: event.transcription_id)
      return unless recording

      recording.update!(transcription_failed_at: event.failed_at)
    end
  end
end
