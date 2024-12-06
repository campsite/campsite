# frozen_string_literal: true

require "test_helper"

module WebhookEvents
  class MessageDmEventTest < ActiveSupport::TestCase
    setup do
      @thread = create(:message_thread, :app_dm)
      @message = create(:message, message_thread: @thread)
      @organization = @message.organization

      application = @thread.owner
      create(:webhook, owner: application, event_types: ["message.dm"])
    end

    test "creates an event for a message" do
      events = WebhookEvents::MessageDm.new(message: @message).call

      assert_equal events.first.subject, @message
    end
  end
end
