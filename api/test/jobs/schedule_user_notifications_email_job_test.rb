# frozen_string_literal: true

require "test_helper"

class ScheduleUserNotificationsEmailJobTest < ActiveJob::TestCase
  context "perform" do
    test "schedules a job when run for the first time" do
      Timecop.travel(Time.parse("2022-12-07T12:00:00Z")) do
        member = create(:organization_membership)
        post = create(:post, organization: member.organization)
        event = post.events.created_action.first!
        notification = create(:notification, :mention, organization_membership: member, event: event, target: post)

        ScheduleUserNotificationsEmailJob.new.perform(notification.user.id, notification.created_at.iso8601)

        assert_enqueued_sidekiq_job(UserNotificationsEmailJob, args: [member.user.id])
      end
    end

    test "does not schedule another job" do
      Timecop.travel(Time.parse("2022-12-07T12:00:00Z")) do
        member = create(:organization_membership)
        post = create(:post, organization: member.organization)
        event = post.events.created_action.first!
        notification = create(:notification, :mention, organization_membership: member, event: event, target: post)

        ScheduleUserNotificationsEmailJob.new.perform(notification.user.id, notification.created_at.iso8601)
        ScheduleUserNotificationsEmailJob.new.perform(notification.user.id, notification.created_at.iso8601)

        assert_enqueued_sidekiq_job(UserNotificationsEmailJob, args: [member.user.id], count: 1)
      end
    end

    test "schedules a job after duration passes" do
      member = create(:organization_membership)

      Timecop.travel(Time.parse("2022-12-07T12:00:00Z")) do
        post = create(:post, organization: member.organization)
        event = post.events.created_action.first!
        notification = create(:notification, :mention, organization_membership: member, event: event, target: post)

        ScheduleUserNotificationsEmailJob.new.perform(notification.user.id, notification.created_at.iso8601)
        ScheduleUserNotificationsEmailJob.new.perform(notification.user.id, notification.created_at.iso8601)

        assert_enqueued_sidekiq_job(UserNotificationsEmailJob, args: [member.user.id], count: 1)
      end

      Sidekiq::Queues.clear_all

      Timecop.travel(Time.parse("2022-12-08T12:00:00Z")) do
        post = create(:post, organization: member.organization)
        event = post.events.created_action.first!
        notification = create(:notification, :mention, organization_membership: member, event: event, target: post)

        refute_enqueued_sidekiq_job(UserNotificationsEmailJob, args: [member.user.id])

        ScheduleUserNotificationsEmailJob.new.perform(notification.user.id, notification.created_at.iso8601)
        ScheduleUserNotificationsEmailJob.new.perform(notification.user.id, notification.created_at.iso8601)

        assert_enqueued_sidekiq_job(UserNotificationsEmailJob, args: [member.user.id], count: 1)
      end
    end
  end
end
