# frozen_string_literal: true

module HmsEvents
  class TranscriptionSuccessEvent < BaseEvent
    TYPE = "transcription.success"

    def handle
      HandleTranscriptionSuccessJob.perform_async(params.to_json)

      { ok: true }
    end

    def transcription_id
      data["transcription_id"]
    end

    def recording_id
      data["recording_id"]
    end

    def transcript_json_path
      data["transcript_json_path"]
    end

    def transcript_srt_path
      data["transcript_srt_path"]
    end

    def transcript_txt_path
      data["transcript_txt_path"]
    end

    def succeeded_at
      data["metadata_timestamp"]
    end
  end
end
