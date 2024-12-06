# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandleSessionOpenSuccessJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/session_open_success_event_payload.json").read)
      @call_room = create(:call_room, remote_room_id: @params.dig("data", "room_id"))
    end

    context "perform" do
      test "creates a Call" do
        Timecop.freeze do
          HandleSessionOpenSuccessJob.new.perform(@params.to_json)

          call = @call_room.calls.find_by!(remote_session_id: @params.dig("data", "session_id"))
          assert_in_delta Time.zone.parse(@params.dig("data", "session_started_at")), call.started_at, 2.seconds
          assert_nil call.project
          assert_equal "none", call.project_permission
        end
      end

      test "stores a chat project call in the project" do
        thread = create(:message_thread, call_room: @call_room)
        project = create(:project, message_thread: thread)

        HandleSessionOpenSuccessJob.new.perform(@params.to_json)

        call = @call_room.calls.find_by!(remote_session_id: @params.dig("data", "session_id"))
        assert_equal project, call.project
        assert_equal "view", call.project_permission
      end

      test "no-op if call already exists" do
        create(:call, room: @call_room, remote_session_id: @params.dig("data", "session_id"))

        assert_nothing_raised do
          HandleSessionOpenSuccessJob.new.perform(@params.to_json)
        end
      end
    end
  end
end
