# frozen_string_literal: true

module HmsEvents
  class HandleBeamFailureJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = BeamFailureEvent.new(JSON.parse(payload))
      call_recording = CallRecording.find_by(remote_beam_id: event.beam_id)
      return unless call_recording

      case event.error_type
      when BeamFailureEvent::SHORT_RECORDING_ERROR_TYPE
        call_recording.destroy!
      else
        Sentry.capture_message(
          "Unhandled failed call recording",
          extra: {
            org_slug: call_recording.call.organization.slug,
            hms_session_url: call_recording.call.hms_session_url,
            error_type: event.error_type,
          },
        )
      end
    end
  end
end
