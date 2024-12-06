# frozen_string_literal: true

require "test_helper"

module WebhookEvents
  class PostCreatedEventTest < ActiveSupport::TestCase
    setup do
      @post = create(:post)
      @organization = @post.organization
      @application = create(:oauth_application, owner: @organization)
      @webhook = create(:webhook, owner: @application, event_types: ["post.created"])
    end

    test "creates a post.created event for a post" do
      events = WebhookEvents::PostCreated.new(post: @post).call

      assert_equal events.first.subject, @post
    end

    test "does not create a post.created event for a webhook without the post.created scope" do
      @webhook.update(event_types: [])
      events = WebhookEvents::PostCreated.new(post: @post).call

      assert_equal 0, events.compact.size
    end

    context "#base_event" do
      test "enqueues a DeliverWebhookJob for each active webhook" do
        create(:webhook, owner: @application, event_types: ["post.created"])
        create(:webhook, :disabled, owner: @application)
        create(:webhook, :discarded, owner: @application)

        assert_difference "WebhookEvent.count", 2 do
          assert_difference "DeliverWebhookJob.jobs.size", 2 do
            events = WebhookEvents::PostCreated.new(post: @post).call
            assert_equal 2, events.compact.size
            events.compact.each do |event|
              assert_includes DeliverWebhookJob.jobs.pluck("args"), [event.id]
              assert_equal event.webhook.application.public_id, event.payload["application_id"]
            end
          end
        end
      end
    end
  end
end
