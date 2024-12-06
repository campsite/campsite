# frozen_string_literal: true

module HmsEvents
  class BeamStoppedSuccessEvent < BaseEvent
    TYPE = "beam.stopped.success"

    def handle
      HandleBeamStoppedSuccessJob.perform_async(params.to_json)

      { ok: true }
    end

    def beam_id
      data["beam_id"]
    end

    def stopped_at
      data["metadata_timestamp"]
    end
  end
end
