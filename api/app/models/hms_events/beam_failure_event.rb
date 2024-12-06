# frozen_string_literal: true

module HmsEvents
  class BeamFailureEvent < BaseEvent
    TYPE = "beam.failure"
    SHORT_RECORDING_ERROR_TYPE = "SHORT_RECORDING_ERROR"

    def handle
      HandleBeamFailureJob.perform_async(params.to_json)

      { ok: true }
    end

    def beam_id
      data["beam_id"]
    end

    def error_type
      data["error_type"]
    end
  end
end
