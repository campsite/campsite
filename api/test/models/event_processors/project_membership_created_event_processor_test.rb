# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class ProjectMembershipCreatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @member = create(:organization_membership, organization: @org)
        create(:integration_organization_membership, organization_membership: @member)
        @member.enable_slack_notifications!
        @pushes = create_list(:web_push_subscription, 2, user: @member.user)
      end

      test "notifies member added to project" do
        project = create(:project, organization: @org)
        project_membership = create(:project_membership, organization_membership: @member, project: project, event_actor: create(:organization_membership, organization: @org))
        event = project_membership.events.created_action.first!

        event.process!

        assert_predicate event.notifications, :one?
        notification = event.notifications.first!
        assert_equal @member, notification.organization_membership
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [notification.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[0].id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[1].id])
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@member.user.channel_name, "project-memberships-stale", nil.to_json])
      end

      test "doesn't notify member when they add themselves to project" do
        project = create(:project, organization: @org, private: true)
        project_membership = create(:project_membership, organization_membership: @member, project: project, event_actor: @member)
        event = project_membership.events.created_action.first!

        event.process!

        assert_predicate event.notifications, :none?
      end

      test "skips notification when oauth application is added to a project" do
        project = create(:project, organization: @org)
        oauth_application = create(:oauth_application, owner: @org)
        project_membership = create(:project_membership, organization_membership: nil, oauth_application: oauth_application, project: project, event_actor: @member)
        event = project_membership.events.created_action.first!

        event.process!

        assert_predicate event.notifications, :none?
      end
    end
  end
end
