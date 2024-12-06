# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class PostFeedbackRequestPublishedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @post_author_member = create(:organization_membership, organization: @org)
        @post = create(:post, :draft, member: @post_author_member, organization: @org)
        @other_member = create(:organization_membership, organization: @org)
      end

      test "notifies the requested member" do
        post_feedback_request = create(:post_feedback_request, member: @other_member, post: @post)
        post_feedback_request.events.created_action.first!.process!

        @post.publish!
        @post.events.published_action.first!.process!

        event = post_feedback_request.events.published_action.first!
        event.process!

        notification = event.notifications.first
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
      end

      test "enqueues Slack message when Slack notifications are enabled" do
        post_feedback_request = create(:post_feedback_request, member: @other_member, post: @post)
        post_feedback_request.events.created_action.first!.process!

        create(:integration_organization_membership, organization_membership: @other_member)
        @other_member.enable_slack_notifications!

        @post.publish!
        @post.events.published_action.first!.process!

        post_feedback_request.events.published_action.first!.process!

        other_member_notification = @other_member.notifications.last!
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [other_member_notification.id])
      end

      test "enqueues web pushes when they are enabled" do
        post_feedback_request = create(:post_feedback_request, member: @other_member, post: @post)
        post_feedback_request.events.created_action.first!.process!

        push1, push2 = create_list(:web_push_subscription, 2, user: @other_member.user)

        @post.publish!
        @post.events.published_action.first!.process!

        post_feedback_request.events.published_action.first!.process!

        other_member_notification = @other_member.notifications.last!
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [other_member_notification.id, push1.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [other_member_notification.id, push2.id])
      end

      test "notifies but does not email when settings disabled" do
        preference = @other_member.user.find_or_initialize_preference(:email_notifications)
        preference.value = "disabled"
        preference.save!

        post_feedback_request = create(:post_feedback_request, member: @other_member, post: @post)
        post_feedback_request.events.created_action.first!.process!

        @post.publish!
        @post.events.published_action.first!.process!

        post_feedback_request.events.published_action.first!.process!

        assert_enqueued_sidekiq_jobs(0, only: ScheduleUserNotificationsEmailJob)
      end

      test "does not notify the requested member if the post is in a private project they don't have access to" do
        project = create(:project, private: true, organization: @org)
        @post.update!(project: project)

        post_feedback_request = create(:post_feedback_request, member: @other_member, post: @post)
        post_feedback_request.events.created_action.first!.process!

        @post.publish!
        @post.events.published_action.first!.process!

        post_feedback_request.events.published_action.first!.process!

        assert_enqueued_sidekiq_jobs(0, only: ScheduleUserNotificationsEmailJob)
      end
    end
  end
end
