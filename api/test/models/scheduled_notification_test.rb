# frozen_string_literal: true

require "test_helper"

class ScheduledNotificationTest < ActiveSupport::TestCase
  describe "#schedulable_in" do
    context "with UTC timezone" do
      test "returns schedulable notifications within the time frame" do
        Timecop.travel(Time.parse("2022-12-07T12:00:00Z")) do
          create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 5.minutes.ago.in_time_zone, time_zone: "UTC")
          first_within_window = create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 5.minutes.from_now.in_time_zone, time_zone: "UTC")
          second_within_window = create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 10.minutes.from_now.in_time_zone, time_zone: "UTC")
          create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 20.minutes.from_now.in_time_zone, time_zone: "UTC")

          expected_schedules = [first_within_window, second_within_window].sort
          assert_equal expected_schedules, ScheduledNotification.schedulable_in(15.minutes)
        end
      end
    end

    context "with non UTC timezone" do
      test "returns schedulable notifications within the time frame" do
        Timecop.travel(Time.parse("2022-12-07T12:00:00Z")) do
          create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 5.minutes.ago.in_time_zone, time_zone: "America/Los_Angeles")
          first_within_window = create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 5.minutes.from_now.in_time_zone, time_zone: "America/Los_Angeles")
          second_within_window = create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 10.minutes.from_now.in_time_zone, time_zone: "America/Los_Angeles")
          create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 20.minutes.from_now.in_time_zone, time_zone: "America/Los_Angeles")

          offset = Time.now.in_time_zone("America/Los_Angeles").utc_offset / 1.hour

          Timecop.travel(Time.current + offset.abs.hours) do
            expected_schedules = [first_within_window, second_within_window].sort
            assert_equal expected_schedules, ScheduledNotification.schedulable_in(15.minutes)
          end
        end
      end
    end

    context "without a delivery day" do
      test "returns schedulable notifications within the time frame" do
        Timecop.travel(Time.parse("2022-12-07T12:00:00Z")) do
          create(:scheduled_notification, delivery_day: nil, delivery_time: 5.minutes.ago.in_time_zone, time_zone: "UTC")
          first_within_window = create(:scheduled_notification, delivery_day: nil, delivery_time: 5.minutes.from_now.in_time_zone, time_zone: "UTC")
          second_within_window = create(:scheduled_notification, delivery_day: nil, delivery_time: 10.minutes.from_now.in_time_zone, time_zone: "UTC")
          create(:scheduled_notification, delivery_day: nil, delivery_time: 20.minutes.from_now.in_time_zone, time_zone: "UTC")

          expected_schedules = [first_within_window, second_within_window].sort
          assert_equal expected_schedules, ScheduledNotification.schedulable_in(15.minutes)
        end
      end
    end

    context "when schedulable range spans two dates" do
      test "returns schedulable notifications within the time frame" do
        # Traveling to a Wednesday
        Timecop.travel(Time.parse("2022-12-07T23:54:00Z")) do
          create(:scheduled_notification, delivery_day: "thursday", delivery_time: 5.minutes.from_now.in_time_zone, time_zone: "UTC")
          within_window_late_wednesday = create(:scheduled_notification, delivery_day: "wednesday", delivery_time: 5.minutes.from_now.in_time_zone, time_zone: "UTC")
          within_window_early_thursday = create(:scheduled_notification, delivery_day: "thursday", delivery_time: 10.minutes.from_now.in_time_zone, time_zone: "UTC")
          create(:scheduled_notification, delivery_day: "wednesday", delivery_time: 10.minutes.from_now.in_time_zone, time_zone: "UTC")

          expected_schedules = [within_window_late_wednesday, within_window_early_thursday].sort
          assert_equal expected_schedules, ScheduledNotification.schedulable_in(15.minutes)
        end
      end
    end

    context "with delivery offsets" do
      test "returns schedulable notifications within the time frame" do
        Timecop.travel(Time.parse("2022-12-07T12:00:00Z")) do
          create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 5.minutes.from_now.in_time_zone, time_zone: "UTC", delivery_offset: -10.minutes.to_i)
          first = create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 5.minutes.ago.in_time_zone, time_zone: "UTC", delivery_offset: 10.minutes.to_i)
          second = create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 5.minutes.from_now.in_time_zone, time_zone: "UTC")
          third = create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 10.minutes.from_now.in_time_zone, time_zone: "UTC", delivery_offset: -5.minutes.to_i)
          create(:scheduled_notification, delivery_day: Time.current.wday, delivery_time: 20.minutes.from_now.in_time_zone, time_zone: "UTC")

          expected_schedules = [first, second, third].sort
          assert_equal expected_schedules, ScheduledNotification.schedulable_in(15.minutes)
        end
      end
    end
  end
end
