# frozen_string_literal: true

require "test_helper"

module WebhookEvents
  class MessageCreatedEventTest < ActiveSupport::TestCase
    setup do
      @message = create(:message)
      @thread = @message.message_thread
      @organization = @message.organization

      application = create(:oauth_application, owner: @organization)
      create(:webhook, owner: application, event_types: ["message.created"])

      @thread.add_oauth_application!(oauth_application: application, actor: @thread.owner)
    end

    test "creates an event for a message" do
      events = WebhookEvents::MessageCreated.new(message: @message).call

      assert_equal events.first.subject, @message
    end
  end
end
