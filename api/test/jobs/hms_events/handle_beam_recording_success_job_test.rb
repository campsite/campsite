# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandleBeamRecordingSuccessJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/beam_recording_success_event_payload.json").read)
      @recording = create(:call_recording, remote_beam_id: @params.dig("data", "beam_id"))
      @message = create(:message, call: @recording.call)
    end

    context "perform" do
      test "updates CallRecording and triggers client message updates" do
        HandleBeamRecordingSuccessJob.new.perform(@params.to_json)

        assert_equal "prefix/ac.mp4", @recording.reload.file_path
        assert_equal "prefix/chat-recording-address.csv", @recording.chat_file_path
        assert_equal @params.dig("data", "recording_id"), @recording.remote_recording_id
        assert_equal @params.dig("data", "size"), @recording.size
        assert_equal @params.dig("data", "max_width"), @recording.max_width
        assert_equal @params.dig("data", "max_height"), @recording.max_height
        assert_equal @params.dig("data", "duration"), @recording.duration
        assert_equal @params.dig("data", "duration"), @recording.call.recordings_duration
        assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@message.sender.id, @message.id, "update-message"])
        assert_enqueued_sidekiq_job(ProcessCallRecordingChatJob, args: [@recording.id])
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@recording.call.channel_name, "call-stale", {}.to_json])
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@recording.call.organization.channel_name, "calls-stale", {}.to_json])
      end

      test "updates Call recording_duration" do
        existing_recording_duration = 10
        call = @recording.call
        call.update!(recordings_duration: existing_recording_duration)
        create(:call_recording, call: call, duration: existing_recording_duration)

        HandleBeamRecordingSuccessJob.new.perform(@params.to_json)

        assert_equal existing_recording_duration + @params.dig("data", "duration"), call.reload.recordings_duration
      end

      test "no-op if recording has already been destroyed" do
        @recording.destroy

        assert_nothing_raised do
          HandleBeamRecordingSuccessJob.new.perform(@params.to_json)
        end
      end
    end
  end
end
