# frozen_string_literal: true

require "test_helper"

class SchedulePostDigestNotificationJobsTest < ActiveJob::TestCase
  context "perform" do
    test "schedules a UserPostDigestNotificationJob" do
      Timecop.travel(Time.parse("2022-12-07T12:00:00Z")) do
        create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 5.minutes.ago.in_time_zone, time_zone: "UTC")
        schedulable = create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 5.minutes.from_now.in_time_zone, time_zone: "UTC")

        SchedulePostDigestNotificationJobs.new.perform

        assert_enqueued_sidekiq_job(UserPostDigestNotificationJob, args: [schedulable.id])
      end
    end
  end
end
