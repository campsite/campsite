# frozen_string_literal: true

require "test_helper"

module WebhookEvents
  class AppMentionedEventTest < ActiveSupport::TestCase
    setup do
      @organization = create(:organization)

      @application = create(:oauth_application, owner: @organization)
      @webhook = create(:webhook, owner: @application, event_types: ["app.mentioned"])

      @mention = MentionsFormatter.format_mention(@application)
    end

    test "creates an event for a post that mentions the app" do
      post = create(:post, organization: @organization, description_html: "Hey #{@mention}")

      events = WebhookEvents::AppMentioned.new(subject: post, oauth_application: @application).call

      assert_equal events.first.subject, post
    end

    test "does not create an app.mentioned event for a webhook without the app.mentioned scope" do
      @webhook.update(event_types: [])
      post = create(:post, organization: @organization, description_html: "Hey #{@mention}")

      events = WebhookEvents::AppMentioned.new(subject: post, oauth_application: @application).call

      assert_equal 0, events.compact.size
    end
  end
end
