# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class PermissionCreatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @member = create(:organization_membership, organization: @org)
        create(:integration_organization_membership, organization_membership: @member)
        @member.enable_slack_notifications!
        @pushes = create_list(:web_push_subscription, 2, user: @member.user)
      end

      test "doesn't notify member for unsupported permission" do
        permission = create(:permission, user: @member.user, subject: create(:post), action: :view)
        event = permission.events.created_action.first!

        event.process!

        assert_predicate event.notifications, :none?
      end

      test "notifies member added to note" do
        note = create(:note, member: create(:organization_membership, organization: @org))
        permission = create(:permission, user: @member.user, subject: note, action: :view)
        event = permission.events.created_action.first!

        event.process!

        assert_predicate event.notifications, :one?
        notification = event.notifications.first!
        assert_equal @member, notification.organization_membership
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [notification.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[0].id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[1].id])
      end

      test "permission has its own scope" do
        note = create(:note, member: create(:organization_membership, organization: @org))
        permission = create(:permission, user: @member.user, subject: note, action: :view)
        permission.events.created_action.first!.process!

        assert_equal 1, @member.user.unread_inbox_notifications.count

        comment = create(:comment, subject: note, member: create(:organization_membership, organization: @org))
        comment.events.created_action.first!.process!

        assert_equal 2, @member.user.unread_inbox_notifications.count
      end

      test "subscribes user when added to a note" do
        note = create(:note, member: create(:organization_membership, organization: @org))
        permission = create(:permission, user: @member.user, subject: note, action: :view)

        assert_not note.subscriptions.exists?(user: @member.user)

        event = permission.events.created_action.first!
        event.process!

        assert note.subscriptions.exists?(user: @member.user)
      end
    end
  end
end
