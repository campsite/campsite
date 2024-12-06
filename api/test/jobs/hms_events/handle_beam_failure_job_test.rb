# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandleBeamFailureJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/beam_failure_event_payload.json").read)
      @recording = create(:call_recording, remote_beam_id: @params.dig("data", "beam_id"))
    end

    context "perform" do
      test "deletes call recording for SHORT_RECORDING_ERROR" do
        @params["data"]["error_type"] = BeamFailureEvent::SHORT_RECORDING_ERROR_TYPE

        HandleBeamFailureJob.new.perform(@params.to_json)

        assert_not CallRecording.exists?(@recording.id)
      end

      test "reports unrecognized error to Sentry" do
        @params["data"]["error_type"] = "SOME_OTHER_ERROR"

        Sentry.expects(:capture_message).with(
          "Unhandled failed call recording",
          extra: {
            org_slug: @recording.call.organization.slug,
            hms_session_url: @recording.call.hms_session_url,
            error_type: "SOME_OTHER_ERROR",
          },
        )

        HandleBeamFailureJob.new.perform(@params.to_json)
      end
    end
  end
end
