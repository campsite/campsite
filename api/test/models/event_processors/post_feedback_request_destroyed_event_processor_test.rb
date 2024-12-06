# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class PostFeedbackRequestDestroyedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @post_author_member = create(:organization_membership, organization: @org)
        @post = create(:post, member: @post_author_member, organization: @org)
        @other_member = create(:organization_membership, organization: @org)
      end

      test "discards notifications for the feedback request" do
        feedback = create(:post_feedback_request, member: @other_member, post: @post)
        created_event = feedback.events.created_action.first!
        created_event.process!
        created_notification = created_event.notifications.first!
        assert_not_predicate created_notification, :discarded?

        feedback.discard
        destroyed_event = feedback.events.destroyed_action.first!
        destroyed_event.process!

        assert_predicate created_notification.reload, :discarded?
      end

      test "enqueues Slack message deletion when message previously delivered" do
        feedback = create(:post_feedback_request, member: @other_member, post: @post)
        created_event = feedback.events.created_action.first!
        created_event.process!
        created_notification = created_event.notifications.first!
        created_notification.update!(slack_message_ts: "12345")

        feedback.discard
        destroyed_event = feedback.events.destroyed_action.first!
        destroyed_event.process!

        assert_enqueued_sidekiq_job(DeleteNotificationSlackMessageJob, args: [created_notification.id])
      end
    end
  end
end
