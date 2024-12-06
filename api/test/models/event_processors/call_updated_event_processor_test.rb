# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class CallUpdatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @call = create(:call)
        @organization = @call.organization
        @member = create(:organization_membership, organization: @organization)
        @member_peer = create(:call_peer, call: @call, organization_membership: @member)
        create(:integration_organization_membership, organization_membership: @member)
        @member.enable_slack_notifications!
        @pushes = create_list(:web_push_subscription, 2, user: @member.user)
        @non_member_peer = create(:call_peer, call: @call, organization_membership: nil)
      end

      test "creates notifications for member peers when processing is complete" do
        @call.update!(generated_summary_status: :completed, generated_title_status: :completed)
        event = @call.events.updated_action.last!

        assert_difference -> { Notification.count }, 1 do
          event.process!
        end

        notification = @member.notifications.last!
        assert_equal "Your call summary is ready", notification.summary_text
        assert_equal @call, notification.subject
        assert_equal @call, notification.target
        assert_enqueued_sidekiq_job(ScheduleUserNotificationsEmailJob, args: [notification.user.id, notification.created_at.iso8601])
        assert_enqueued_sidekiq_job(DeliverNotificationSlackMessageJob, args: [notification.id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[0].id])
        assert_enqueued_sidekiq_job(DeliverWebPushNotificationJob, args: [notification.id, @pushes[1].id])
      end

      test "does not create notifications when processing is not complete" do
        @call.update!(generated_summary_status: :completed, generated_title_status: :processing)
        event = @call.events.updated_action.last!

        assert_no_difference -> { Notification.count } do
          event.process!
        end
      end

      test "does not create notifications when processing was previously complete" do
        @call.update!(generated_summary_status: :completed, generated_title_status: :completed)
        @call.update!(title: "foobar")

        event = @call.events.updated_action.last!

        assert_no_difference -> { Notification.count } do
          event.process!
        end
      end
    end
  end
end
