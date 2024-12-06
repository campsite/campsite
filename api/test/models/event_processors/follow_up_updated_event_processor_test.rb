# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class FollowUpUpdatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @follow_up = create(:follow_up)
        @member = @follow_up.organization_membership
        create(:integration_organization_membership, organization_membership: @member)
        @member.enable_slack_notifications!
        @pushes = create_list(:web_push_subscription, 2, user: @member.user)
      end

      test "notifies member when post follow up is shown" do
        @follow_up.show!
        event = @follow_up.events.updated_action.first!

        event.process!

        assert_predicate event.notifications, :one?
        notification = event.notifications.first!
        assert_equal @member, notification.organization_membership
        assert_equal @follow_up.subject, notification.target
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [notification.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[0].id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[1].id])
      end

      test "notifies member when comment follow up is shown" do
        post = create(:post, organization: @member.organization)
        comment = create(:comment, subject: post)
        comment_follow_up = create(:follow_up, organization_membership: @member, subject: comment)
        comment_follow_up.show!
        event = comment_follow_up.events.updated_action.first!

        event.process!

        assert_predicate event.notifications, :one?
        notification = event.notifications.first!
        assert_equal @member, notification.organization_membership
        assert_equal post, notification.target
        assert_equal comment, notification.subtarget
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [notification.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[0].id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[1].id])
      end

      test "notifies member when note follow up is shown" do
        note = create(:note, member: @member)
        note_follow_up = create(:follow_up, organization_membership: @member, subject: note)
        note_follow_up.show!
        event = note_follow_up.events.updated_action.first!

        event.process!

        assert_predicate event.notifications, :one?
        notification = event.notifications.first!
        assert_equal @member, notification.organization_membership
        assert_equal note, notification.target
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [notification.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[0].id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[1].id])
      end

      test "no-op when follow up is updated but not shown" do
        @follow_up.update!(show_at: 3.days.from_now)
        event = @follow_up.events.updated_action.first!

        event.process!

        assert_empty event.notifications
      end
    end
  end
end
