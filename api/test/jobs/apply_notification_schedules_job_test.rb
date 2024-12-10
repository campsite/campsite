# frozen_string_literal: true

require "test_helper"

class ApplyNotificationSchedulesTest < ActiveJob::TestCase
  setup do
    @user = create(:user, preferred_timezone: "America/Los_Angeles")
    @schedule = create(:notification_schedule, user: @user, start_time: "09:00", end_time: "17:00")
    @pdt_offset = -7.hours
  end

  context "#perform" do
    test "pauses notifications" do
      Timecop.freeze(Time.zone.parse("2024-09-26T17:00Z") - @pdt_offset) do
        assert_query_count 9 do
          ApplyNotificationSchedulesJob.new.perform
        end

        assert_in_delta Time.zone.parse("2024-09-27T9:00Z") - @pdt_offset, @user.reload.notification_pause_expires_at, 2.seconds
        assert_in_delta Time.current, @schedule.reload.last_applied_at, 2.seconds
      end
    end

    test "extends existing notification pause" do
      Timecop.freeze(Time.zone.parse("2024-09-26T17:00Z") - @pdt_offset) do
        @user.update!(notification_pause_expires_at: 1.hour.from_now)

        ApplyNotificationSchedulesJob.new.perform

        assert_in_delta Time.zone.parse("2024-09-27T9:00Z") - @pdt_offset, @user.reload.notification_pause_expires_at, 2.seconds
        assert_in_delta Time.current, @schedule.reload.last_applied_at, 2.seconds
      end
    end

    test "does not overwrite longer existing pause" do
      Timecop.freeze(Time.zone.parse("2024-09-26T17:00Z") - @pdt_offset) do
        @user.update!(notification_pause_expires_at: 1.week.from_now)

        ApplyNotificationSchedulesJob.new.perform

        assert_in_delta 1.week.from_now, @user.reload.notification_pause_expires_at, 2.seconds
        assert_in_delta Time.current, @schedule.reload.last_applied_at, 2.seconds
      end
    end

    test "does not pause notifications if user currently scheduled to receive notifications" do
      Timecop.freeze(Time.zone.parse("2024-09-26T16:59") - @pdt_offset) do
        ApplyNotificationSchedulesJob.new.perform

        assert_nil @user.reload.notification_pause_expires_at
        assert_nil @schedule.reload.last_applied_at
      end
    end

    test "does not pause notifications if schedule has already been applied today" do
      Timecop.freeze(Time.zone.parse("2024-09-26T17:00Z") - @pdt_offset) do
        @schedule.update!(last_applied_at: Time.zone.parse("2024-09-26T00:00Z") - @pdt_offset)

        ApplyNotificationSchedulesJob.new.perform

        assert_nil @user.reload.notification_pause_expires_at
      end
    end

    test "pauses notifications if schedule was applied yesterday" do
      Timecop.freeze(Time.zone.parse("2024-09-26T17:00Z") - @pdt_offset) do
        @schedule.update!(last_applied_at: Time.zone.parse("2024-09-25T23:59Z") - @pdt_offset)

        ApplyNotificationSchedulesJob.new.perform

        assert_in_delta Time.zone.parse("2024-09-27T9:00Z") - @pdt_offset, @user.reload.notification_pause_expires_at, 2.seconds
        assert_in_delta Time.current, @schedule.reload.last_applied_at, 2.seconds
      end
    end

    test "when it's Friday and schedule excludes Saturday, pause expires on Sunday" do
      Timecop.freeze(Time.zone.parse("2024-09-27T17:00Z") - @pdt_offset) do
        @schedule.update!(saturday: false)

        ApplyNotificationSchedulesJob.new.perform

        assert_in_delta Time.zone.parse("2024-09-29T9:00Z") - @pdt_offset, @user.reload.notification_pause_expires_at, 2.seconds
        assert_in_delta Time.current, @schedule.reload.last_applied_at, 2.seconds
      end
    end

    test "when it's Friday and schedule excludes Saturday and Sunday, pause expires on Monday" do
      Timecop.freeze(Time.zone.parse("2024-09-27T17:00Z") - @pdt_offset) do
        @schedule.update!(saturday: false, sunday: false)

        ApplyNotificationSchedulesJob.new.perform

        assert_in_delta Time.zone.parse("2024-09-30T9:00Z") - @pdt_offset, @user.reload.notification_pause_expires_at, 2.seconds
        assert_in_delta Time.current, @schedule.reload.last_applied_at, 2.seconds
      end
    end

    test "when it's Friday and schedule excludes Friday, no-op" do
      Timecop.freeze(Time.zone.parse("2024-09-27T17:00Z") - @pdt_offset) do
        @schedule.update!(friday: false)

        ApplyNotificationSchedulesJob.new.perform

        assert_nil @user.reload.notification_pause_expires_at
        assert_nil @schedule.reload.last_applied_at
      end
    end

    test "uses UTC when user is missing preferred_timezone" do
      @user.update!(preferred_timezone: nil)

      Timecop.freeze(Time.zone.parse("2024-09-26T17:00Z")) do
        ApplyNotificationSchedulesJob.new.perform

        assert_in_delta Time.zone.parse("2024-09-27T9:00Z"), @user.reload.notification_pause_expires_at, 2.seconds
        assert_in_delta Time.current, @schedule.reload.last_applied_at, 2.seconds
      end
    end
  end
end
