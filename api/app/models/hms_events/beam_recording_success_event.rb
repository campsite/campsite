# frozen_string_literal: true

module HmsEvents
  class BeamRecordingSuccessEvent < BaseEvent
    TYPE = "beam.recording.success"

    def handle
      HandleBeamRecordingSuccessJob.perform_async(params.to_json)

      { ok: true }
    end

    def beam_id
      data["beam_id"]
    end

    def recording_path
      data["recording_path"]
    end

    def chat_recording_path
      data["chat_recording_path"]
    end

    def recording_id
      data["recording_id"]
    end

    def size
      data["size"]
    end

    def duration
      data["duration"]
    end

    def max_width
      data["max_width"]
    end

    def max_height
      data["max_height"]
    end
  end
end
