# frozen_string_literal: true

module HmsEvents
  class HandleTranscriptionStartedSuccessJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = TranscriptionStartedSuccessEvent.new(JSON.parse(payload))

      recording = CallRecording.find_by(remote_recording_id: event.recording_id)
      return unless recording

      recording.update!(
        transcription_started_at: event.started_at,
        remote_transcription_id: event.transcription_id,
      )
      recording.call.trigger_stale
    end
  end
end
