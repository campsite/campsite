# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandlePeerLeaveSuccessJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/peer_leave_success_event_payload.json").read)
      room = create(:call_room, remote_room_id: @params.dig("data", "room_id"))
      @call = create(:call, room: room, remote_session_id: @params.dig("data", "session_id"))
      @peer = create(:call_peer, call: @call, remote_peer_id: @params.dig("data", "peer_id"))
      @message = create(:message, call: @peer.call, message_thread: @peer.call.subject)
    end

    context "perform" do
      test "updates the CallPeer and triggers client message updates" do
        Timecop.freeze do
          HandlePeerLeaveSuccessJob.new.perform(@params.to_json)

          assert_in_delta Time.zone.parse(@params.dig("data", "left_at")), @peer.reload.left_at, 2.seconds
          assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@message.sender.id, @message.id, "update-message"])
          assert_enqueued_sidekiq_job(StopCallRecordingJob, args: [@peer.call.id])
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @peer.user.channel_name,
            "current-user-stale",
            {
              current_user: CurrentUserSerializer.render_as_hash(@peer.user),
            }.to_json,
          ])
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @peer.call.room.channel_name,
            "call-room-stale",
            nil.to_json,
          ])
        end
      end

      test "does not attempt to stop recording if other active peers" do
        Timecop.freeze do
          create(:call_peer, :active, call: @peer.call)
          HandlePeerLeaveSuccessJob.new.perform(@params.to_json)

          assert_in_delta Time.zone.parse(@params.dig("data", "left_at")), @peer.reload.left_at, 2.seconds
          assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@message.sender.id, @message.id, "update-message"])
          refute_enqueued_sidekiq_job(StopCallRecordingJob, args: [@peer.call.id])
        end
      end

      test "create Call and CallPeer records if missing" do
        Timecop.freeze do
          @peer.destroy!
          @call.destroy!

          HandlePeerLeaveSuccessJob.new.perform(@params.to_json)

          call = Call.find_by!(remote_session_id: @params.dig("data", "session_id"))
          peer = call.peers.find_by!(remote_peer_id: @params.dig("data", "peer_id"))
          assert_in_delta Time.zone.parse(@params.dig("data", "left_at")), peer.left_at, 2.seconds
        end
      end
    end
  end
end
