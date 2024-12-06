# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class ProjectUpdatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @member = create(:organization_membership, organization: @org)
        create(:integration_organization_membership, organization_membership: @member)
        @member.enable_slack_notifications!
        @pushes = create_list(:web_push_subscription, 2, user: @member.user)
        @project = create(:project, organization: @org)
        create(:project_membership, organization_membership: @member, project: @project)
      end

      test "notifies project member when project is archived" do
        @project.archive!(create(:organization_membership, organization: @org))
        event = @project.events.updated_action.first!

        event.process!

        assert_predicate event.notifications, :one?
        notification = event.notifications.first!
        assert_equal @member, notification.organization_membership
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [notification.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[0].id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[1].id])
      end

      test "deletes archived notification when project is unarchived" do
        @project.archive!(create(:organization_membership, organization: @org))
        archived_event = @project.events.updated_action.first!
        archived_event.process!
        notification = archived_event.notifications.first!
        notification.update!(slack_message_ts: "12345")

        @project.unarchive!
        unarchived_event = @project.events.updated_action.last!
        unarchived_event.process!

        assert_predicate notification.reload, :discarded?
        assert_enqueued_sidekiq_job(DeleteNotificationSlackMessageJob, args: [notification.id])
      end

      test "no-op when project is updated but not archived or unarchived" do
        @project.update!(name: "A nu start")
        event = @project.events.updated_action.first!

        event.process!

        assert_empty event.notifications
      end

      test "does not attempt to notify OAuth application about archived project" do
        project = create(:project, organization: @org)
        project.add_oauth_application!(create(:oauth_application))
        project.archive!(create(:organization_membership, organization: @org))
        archived_event = project.events.updated_action.first!

        archived_event.process!

        assert_empty archived_event.notifications
      end
    end
  end
end
