# frozen_string_literal: true

module HmsEvents
  class TranscriptionStartedSuccessEvent < BaseEvent
    TYPE = "transcription.started.success"

    def handle
      HandleTranscriptionStartedSuccessJob.perform_async(params.to_json)

      { ok: true }
    end

    def recording_id
      data["recording_id"]
    end

    def transcription_id
      data["transcription_id"]
    end

    def started_at
      data["metadata_timestamp"]
    end
  end
end
