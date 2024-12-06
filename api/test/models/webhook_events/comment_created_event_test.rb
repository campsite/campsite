# frozen_string_literal: true

require "test_helper"

module WebhookEvents
  class CommentCreatedEventTest < ActiveSupport::TestCase
    setup do
      @comment = create(:comment)
      @post = @comment.subject
      @organization = @post.organization

      application = create(:oauth_application, owner: @organization)
      @webhook = create(:webhook, owner: application, event_types: ["comment.created"])
    end

    test "creates an event for a comment" do
      events = WebhookEvents::CommentCreated.new(comment: @comment).call

      assert_equal events.first.subject, @comment
    end

    test "does not create a comment.created event for a webhook without the comment.created scope" do
      @webhook.update(event_types: [])
      events = WebhookEvents::CommentCreated.new(comment: @comment).call

      assert_equal 0, events.compact.size
    end
  end
end
