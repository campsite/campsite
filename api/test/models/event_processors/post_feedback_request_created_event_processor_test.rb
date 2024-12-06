# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class PostFeedbackRequestCreatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @post_author_member = create(:organization_membership, organization: @org)
        @post = create(:post, member: @post_author_member, organization: @org)
        @other_member = create(:organization_membership, organization: @org)
      end

      test "notifies the requested member" do
        event = create(:post_feedback_request, member: @other_member, post: @post).events.created_action.first!

        event.process!
        notification = @other_member.notifications.first
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
      end

      test "does not notify the requested member if the post is a draft" do
        post = create(:post, :draft, member: @post_author_member, organization: @org)
        event = create(:post_feedback_request, member: @other_member, post: post).events.created_action.first!

        event.process!

        assert_enqueued_sidekiq_jobs(0, only: ScheduleUserNotificationsEmailJob)
      end

      test "enqueues Slack message when Slack notifications are enabled" do
        event = create(:post_feedback_request, member: @other_member, post: @post).events.created_action.first!
        create(:integration_organization_membership, organization_membership: @other_member)
        @other_member.enable_slack_notifications!

        event.process!

        other_member_notification = @other_member.notifications.last!
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [other_member_notification.id])
      end

      test "does not enqueue Slack message when post is a draft" do
        post = create(:post, :draft, member: @post_author_member, organization: @org)
        event = create(:post_feedback_request, member: @other_member, post: post).events.created_action.first!
        create(:integration_organization_membership, organization_membership: @other_member)
        @other_member.enable_slack_notifications!

        event.process!

        assert_enqueued_sidekiq_jobs(0, only: DeliverNotificationSlackMessageJob)
      end

      test "enqueues web pushes when they are enabled" do
        event = create(:post_feedback_request, member: @other_member, post: @post).events.created_action.first!
        push1, push2 = create_list(:web_push_subscription, 2, user: @other_member.user)

        event.process!

        other_member_notification = @other_member.notifications.last!
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [other_member_notification.id, push1.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [other_member_notification.id, push2.id])
      end

      test "does not enqueue web pushes when post is a draft" do
        post = create(:post, :draft, member: @post_author_member, organization: @org)
        event = create(:post_feedback_request, member: @other_member, post: post).events.created_action.first!
        create_list(:web_push_subscription, 2, user: @other_member.user)

        event.process!

        assert_enqueued_sidekiq_jobs(0, only: DeliverWebPushNotificationJob)
      end

      test "notifies but does not email when settings disabled" do
        preference = @other_member.user.find_or_initialize_preference(:email_notifications)
        preference.value = "disabled"
        preference.save!

        create(:post_feedback_request, member: @other_member, post: @post).events.created_action.first!

        assert_enqueued_sidekiq_jobs(0, only: ScheduleUserNotificationsEmailJob)
      end

      test "does not notify the requested member if the post is in a private project they don't have access to" do
        project = create(:project, private: true, organization: @org)
        @post.update!(project: project)
        event = create(:post_feedback_request, member: @other_member, post: @post).events.created_action.first!

        event.process!

        assert_enqueued_sidekiq_jobs(0, only: ScheduleUserNotificationsEmailJob)
      end

      test "does not notify the requested member if the post is a draft" do
        post = create(:post, :draft, member: @post_author_member, organization: @org)
        event = create(:post_feedback_request, member: @other_member, post: post).events.created_action.first!

        event.process!

        assert_enqueued_sidekiq_jobs(0, only: ScheduleUserNotificationsEmailJob)
      end
    end
  end
end
