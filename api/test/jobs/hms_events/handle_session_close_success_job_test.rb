# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandleSessionCloseSuccessJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/session_close_success_event_payload.json").read)
      @call_room = create(:call_room, remote_room_id: @params.dig("data", "room_id"))
      @session_stopped_at = Time.zone.parse(@params.dig("data", "session_stopped_at"))
      @call = create(:call, room: @call_room, remote_session_id: @params.dig("data", "session_id"), started_at: @session_stopped_at - 5.minutes)
      @message = create(:message, call: @call)
      @invitee = create(:organization_membership, organization: @call_room.organization)
      @invitation = @call_room.invitations.create!(
        creator_organization_membership: create(:organization_membership, organization: @call_room.organization),
        invitee_organization_membership_ids: [@invitee.id],
      )
    end

    context "perform" do
      test "updates the Call, triggers client message + invitation updates" do
        Timecop.freeze do
          HandleSessionCloseSuccessJob.new.perform(@params.to_json)

          assert_in_delta @session_stopped_at, @call.reload.stopped_at, 2.seconds
          assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@message.sender.id, @message.id, "update-message"])
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@invitee.user.channel_name, "call-room-invitation-destroyed", { call_room_id: @call_room.public_id }.to_json])
        end
      end

      test "deletes the message if only one peer, no recording, and call is shorter than 30 seconds" do
        @message.message_thread.update!(latest_message: @message)
        @call.update!(started_at: @session_stopped_at - 29.seconds)

        HandleSessionCloseSuccessJob.new.perform(@params.to_json)

        assert_predicate @message.reload, :discarded?
        assert_nil @message.message_thread.reload.latest_message
        assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [@message.sender.id, @message.id, "update-message"])
      end

      test "creates a call record if missing" do
        Timecop.freeze do
          @call.destroy!

          HandleSessionCloseSuccessJob.new.perform(@params.to_json)

          call = Call.find_by!(remote_session_id: @params.dig("data", "session_id"))
          assert_in_delta @session_stopped_at, call.reload.stopped_at, 2.seconds
        end
      end

      test "sets call_peers.left_at if nil" do
        Timecop.freeze do
          organization_membership = create(:organization_membership, organization: @call.organization)
          peer = create(:call_peer, call: @call, organization_membership: organization_membership, left_at: nil)

          HandleSessionCloseSuccessJob.new.perform(@params.to_json)

          assert_in_delta @session_stopped_at, peer.reload.left_at, 2.seconds
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            peer.user.channel_name,
            "current-user-stale",
            {
              current_user: CurrentUserSerializer.render_as_hash(peer.user),
            }.to_json,
          ])
        end
      end
    end
  end
end
