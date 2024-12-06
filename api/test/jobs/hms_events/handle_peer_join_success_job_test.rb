# frozen_string_literal: true

require "test_helper"

module HmsEvents
  class HandlePeerJoinSuccessJobTest < ActiveJob::TestCase
    before(:each) do
      @params = JSON.parse(file_fixture("hms/peer_join_success_event_payload.json").read)
    end

    context "call for a DM message thread" do
      before(:each) do
        @thread = create(:message_thread, :dm)
        @room = create(:call_room, remote_room_id: @params.dig("data", "room_id"), subject: @thread)
        @call = create(:call, room: @room, remote_session_id: @params.dig("data", "session_id"))
        @caller_member = @thread.organization_memberships.first!
        @caller_member.user.update_columns(public_id: @params.dig("data", "user_id"))
        @callee_member = @thread.organization_memberships.second!
        @callee_member_web_push_subscription = create(:web_push_subscription, user: @callee_member.user)
      end

      test "creates a CallPeer, sends a message, and prompts other user" do
        Timecop.freeze do
          HandlePeerJoinSuccessJob.new.perform(@params.to_json)

          peer = @call.reload.peers.find_by!(organization_membership: @caller_member)
          assert_equal @params["data"]["user_name"], peer.name
          assert_in_delta Time.zone.parse(@params.dig("data", "joined_at")), peer.joined_at, 2.seconds
          message = @thread.messages.find_by!(call: @call)
          assert_equal @caller_member, message.sender
          assert_enqueued_sidekiq_job(DeliverWebPushCallRoomInvitationJob, args: [
            @room.id,
            @caller_member.id,
            @callee_member_web_push_subscription.id,
          ])
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @callee_member.user.channel_name,
            "incoming-call-room-invitation",
            {
              call_room_id: @thread.call_room.public_id,
              call_room_url: @thread.call_room.url,
              creator_member: OrganizationMemberSerializer.render_as_hash(@caller_member),
              other_active_peers: [],
              skip_push: false,
            }.to_json,
          ])
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @caller_member.user.channel_name,
            "current-user-stale",
            {
              current_user: CurrentUserSerializer.render_as_hash(@caller_member.user),
            }.to_json,
          ])
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @call.room.channel_name,
            "call-room-stale",
            nil.to_json,
          ])
        end
      end

      test "prompts user but does not send push notification when user has paused notifications" do
        Timecop.freeze do
          @callee_member.user.update!(notification_pause_expires_at: 1.day.from_now)

          HandlePeerJoinSuccessJob.new.perform(@params.to_json)

          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @callee_member.user.channel_name,
            "incoming-call-room-invitation",
            {
              call_room_id: @thread.call_room.public_id,
              call_room_url: @thread.call_room.url,
              creator_member: OrganizationMemberSerializer.render_as_hash(@caller_member),
              other_active_peers: [],
              skip_push: true,
            }.to_json,
          ])
        end
      end

      test "does not prompt other user if other user is actively on another call" do
        create(:call_peer, :active, organization_membership: @callee_member)

        HandlePeerJoinSuccessJob.new.perform(@params.to_json)

        refute_enqueued_sidekiq_job(PusherTriggerJob, args: [
          @callee_member.user.channel_name,
          "incoming-call-room-invitation",
          {
            call_room_id: @thread.call_room.public_id,
            call_room_url: @thread.call_room.url,
            creator_member: OrganizationMemberSerializer.render_as_hash(@caller_member),
            other_active_peers: [],
            skip_push: false,
          }.to_json,
        ])
      end

      test "does not send a message if one already exists for this call and thread" do
        message = create(:message, call: @call, message_thread: @thread)

        assert_no_difference "Message.count" do
          HandlePeerJoinSuccessJob.new.perform(@params.to_json)
        end

        assert_enqueued_sidekiq_job(InvalidateMessageJob, args: [message.sender.id, message.id, "update-message"])
      end

      test "creates call record if missing" do
        @call.destroy!

        HandlePeerJoinSuccessJob.new.perform(@params.to_json)

        call = Call.find_by!(remote_session_id: @params.dig("data", "session_id"))
        assert call.reload.peers.exists?(organization_membership: @caller_member)
      end
    end

    context "call for a group message thread" do
      before(:each) do
        @thread = create(:message_thread, :group)
        room = create(:call_room, remote_room_id: @params.dig("data", "room_id"), subject: @thread)
        @call = create(:call, room: room, remote_session_id: @params.dig("data", "session_id"))
        @caller_member = @thread.organization_memberships.first!
        @caller_member.user.update_columns(public_id: @params.dig("data", "user_id"))
        @callee_member = @thread.organization_memberships.second!
      end

      test "doesn't send an incoming call prompt for a group call" do
        Timecop.freeze do
          HandlePeerJoinSuccessJob.new.perform(@params.to_json)

          peer = @call.reload.peers.find_by!(organization_membership: @caller_member)
          assert_equal @params["data"]["user_name"], peer.name
          assert_in_delta Time.zone.parse(@params.dig("data", "joined_at")), peer.joined_at, 2.seconds
          message = @thread.messages.find_by!(call: @call)
          assert_equal @caller_member, message.sender
          refute_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @callee_member.user.channel_name,
            "incoming-call-room-invitation",
            {
              call_room_id: @thread.call_room.public_id,
              call_room_url: @thread.call_room.url,
              creator_member: OrganizationMemberSerializer.render_as_hash(@caller_member),
              other_active_peers: [],
              skip_push: false,
            }.to_json,
          ])
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @call.room.channel_name,
            "call-room-stale",
            nil.to_json,
          ])
        end
      end
    end

    context "call for a subjectless call room" do
      before(:each) do
        room = create(:call_room, remote_room_id: @params.dig("data", "room_id"))
        @call = create(:call, room: room, remote_session_id: @params.dig("data", "session_id"))
      end

      test "creates a call peer for an organization member" do
        member = create(:organization_membership, organization: @call.room.organization, user: create(:user, public_id: @params.dig("data", "user_id")))

        Timecop.freeze do
          HandlePeerJoinSuccessJob.new.perform(@params.to_json)

          peer = @call.reload.peers.find_by!(organization_membership: member)
          assert_equal @params["data"]["user_name"], peer.name
          assert_in_delta Time.zone.parse(@params.dig("data", "joined_at")), peer.joined_at, 2.seconds
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @call.room.channel_name,
            "call-room-stale",
            nil.to_json,
          ])
        end
      end

      test "creates a call peer for a logged-out user" do
        params = @params.dup
        params["data"]["user_id"] = nil

        Timecop.freeze do
          HandlePeerJoinSuccessJob.new.perform(@params.to_json)

          peer = @call.reload.peers.last!
          assert_nil peer.organization_membership
          assert_equal params["data"]["user_name"], peer.name
          assert_in_delta Time.zone.parse(@params.dig("data", "joined_at")), peer.joined_at, 2.seconds
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @call.room.channel_name,
            "call-room-stale",
            nil.to_json,
          ])
        end
      end
    end
  end
end
