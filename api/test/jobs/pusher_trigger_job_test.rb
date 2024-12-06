# frozen_string_literal: true

require "test_helper"

class PusherTriggerJobTest < ActiveJob::TestCase
  context "#perform" do
    test "calls Pusher.trigger" do
      channel = "post-abc123"
      event = "content-stale"
      data = {
        user_id: "def456",
        attributes: { title: "My title" },
      }

      Pusher.expects(:trigger).with(channel, event, data, {})

      PusherTriggerJob.new.perform(channel, event, data.to_json)
    end

    test "includes socket_id if present" do
      channel = "post-abc123"
      event = "content-stale"
      data = {
        user_id: "def456",
        attributes: { title: "My title" },
      }
      socket_id = "123.456"

      Current.expects(:pusher_socket_id).returns(socket_id)
      Pusher.expects(:trigger).with(channel, event, data, { socket_id: socket_id })

      PusherTriggerJob.new.perform(channel, event, data.to_json)
    end
  end
end
