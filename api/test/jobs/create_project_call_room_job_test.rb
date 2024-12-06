# frozen_string_literal: true

require "test_helper"

class CreateProjectCallRoomJobTest < ActiveJob::TestCase
  setup do
    @project = create(:project)
    @project.add_member!(@project.creator)
  end

  context "perform" do
    test "creates call room and updates project" do
      Pusher.expects(:trigger).with(
        @project.creator.user.channel_name,
        "project-updated",
        has_keys(:id, :call_room_url),
      )

      VCR.use_cassette("hms/create_room") do
        CreateProjectCallRoomJob.new.perform(@project.id)
      end

      call_room = @project.reload.call_room
      assert_predicate call_room.remote_room_id, :present?
      assert_equal @project.organization, call_room.organization
      assert_equal @project.creator, call_room.creator
      assert_equal "subject", call_room.source
    end
  end
end
