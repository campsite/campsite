# frozen_string_literal: true

require "test_helper"

class CreateMessageThreadCallRoomJobTest < ActiveJob::TestCase
  setup do
    @message_thread = create(:message_thread, :group)
  end

  context "perform" do
    test "creates call room and updates thread" do
      Pusher.expects(:trigger).with(
        @message_thread.owner.user.channel_name,
        "thread-updated",
        {
          id: @message_thread.public_id,
          organization_slug: @message_thread.organization_slug,
          remote_call_room_id: "6579eab2afd3b28533492e0d",
        },
      )

      VCR.use_cassette("hms/create_room") do
        CreateMessageThreadCallRoomJob.new.perform(@message_thread.id)
      end

      call_room = @message_thread.reload.call_room
      assert_predicate call_room.remote_room_id, :present?
      assert_equal @message_thread.organization, call_room.organization
      assert_equal @message_thread.owner, call_room.creator
      assert_equal "subject", call_room.source
    end
  end
end
