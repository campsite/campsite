# frozen_string_literal: true

module HmsEvents
  class TranscriptionFailureEvent < BaseEvent
    TYPE = "transcription.failure"

    def handle
      HandleTranscriptionFailureJob.perform_async(params.to_json)

      { ok: true }
    end

    def transcription_id
      data["transcription_id"]
    end

    def failed_at
      data["metadata_timestamp"]
    end
  end
end
