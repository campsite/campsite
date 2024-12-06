# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandleBeamStartedSuccessJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/beam_started_success_event_payload.json").read)
      room = create(:call_room, remote_room_id: @params.dig("data", "room_id"))
      @call = create(:call, room: room, remote_session_id: @params.dig("data", "session_id"))
    end

    context "perform" do
      test "creates a CallRecording" do
        Timecop.freeze do
          HandleBeamStartedSuccessJob.new.perform(@params.to_json)

          recording = @call.recordings.find_by!(remote_beam_id: @params.dig("data", "beam_id"))
          assert_equal @params.dig("data", "job_id"), recording.remote_job_id
          assert_in_delta Time.zone.parse(@params.dig("data", "metadata_timestamp")), recording.started_at, 2.seconds
          assert_predicate recording.public_id, :present?
        end
      end

      test "creates call record if missing" do
        @call.destroy!

        Timecop.freeze do
          HandleBeamStartedSuccessJob.new.perform(@params.to_json)

          call = Call.find_by!(remote_session_id: @params.dig("data", "session_id"))
          recording = call.recordings.find_by!(remote_beam_id: @params.dig("data", "beam_id"))
          assert_equal @params.dig("data", "job_id"), recording.remote_job_id
          assert_in_delta Time.zone.parse(@params.dig("data", "metadata_timestamp")), recording.started_at, 2.seconds
          assert_predicate recording.public_id, :present?
        end
      end
    end
  end
end
