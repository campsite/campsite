# frozen_string_literal: true

require "test_helper"

class CreateHmsCallRoomJobTest < ActiveJob::TestCase
  setup do
    @call_room = create(:call_room)
  end

  context "perform" do
    test "creates call room" do
      VCR.use_cassette("hms/create_room") do
        CreateHmsCallRoomJob.new.perform(@call_room.id)
      end

      assert_predicate @call_room.remote_room_id, :present?
      assert_enqueued_sidekiq_job PusherTriggerJob, args: [@call_room.channel_name, "call-room-stale", nil.to_json]
    end
  end
end
