# frozen_string_literal: true

class NotificationSchedule < ApplicationRecord
  PREDICATE_BY_WDAY = {
    0 => :sunday?,
    1 => :monday?,
    2 => :tuesday?,
    3 => :wednesday?,
    4 => :thursday?,
    5 => :friday?,
    6 => :saturday?,
  }

  belongs_to :user

  scope :needs_applying, -> {
    user_tz_sql = "COALESCE(users.preferred_timezone, 'UTC')"

    joins(:user)
      .where(
        <<~SQL.squish, { now: Time.current }
          /* It's currently end_time or later in user's timezone */
          CONVERT_TZ(:now, 'UTC', #{user_tz_sql}) >= CONCAT(DATE(CONVERT_TZ(:now, 'UTC', #{user_tz_sql})), ' ', end_time)
          /* It's a day when this schedule should be applied */
          AND (
            CASE DAYOFWEEK(CONVERT_TZ(:now, 'UTC', #{user_tz_sql}))
              WHEN 1 THEN sunday = 1
              WHEN 2 THEN monday = 1
              WHEN 3 THEN tuesday = 1
              WHEN 4 THEN wednesday = 1
              WHEN 5 THEN thursday = 1
              WHEN 6 THEN friday = 1
              WHEN 7 THEN saturday = 1
            END
          )
          /* Schedule not already applied today in user's timezone */
          AND (
            last_applied_at IS NULL
            OR DATE(CONVERT_TZ(last_applied_at, 'UTC', #{user_tz_sql})) < DATE(CONVERT_TZ(:now, 'UTC', #{user_tz_sql}))
          )
        SQL
      )
  }

  validates :start_time, :end_time, presence: true
  validate :start_time_must_be_before_end_time
  validate :must_have_at_least_one_day

  def apply!
    return unless end_time_or_later? && should_apply_today?

    user.pause_notifications!(expires_at: next_start_time) unless preexisting_longer_pause?
    update!(last_applied_at: Time.current)
  end

  def days
    [].tap do |days|
      PREDICATE_BY_WDAY.each do |wday, predicate|
        days << Date::DAYNAMES[wday] if public_send(predicate)
      end
    end
  end

  def start_time_formatted
    start_time.strftime("%H:%M")
  end

  def end_time_formatted
    end_time.strftime("%H:%M")
  end

  private

  def end_time_or_later?
    end_time && !user_now.before?(user_now.change(hour: end_time.hour, min: end_time.min))
  end

  def preexisting_longer_pause?
    user.notification_pause_expires_at.present? && user.notification_pause_expires_at.after?(next_start_time)
  end

  def next_start_time
    return @next_start_time if defined?(@next_start_time)

    @next_start_time = user_now + 1.day
    @next_start_time += 1.day until should_apply_on_wday?(@next_start_time.wday) || @next_start_time >= user_now + 1.week
    @next_start_time = @next_start_time.change(hour: start_time.hour, min: start_time.min)
  end

  def should_apply_today?
    should_apply_on_wday?(user_now.wday)
  end

  def should_apply_on_wday?(wday)
    public_send(PREDICATE_BY_WDAY[wday])
  end

  def user_now
    Time.now.in_time_zone(user.preferred_timezone || "UTC")
  end

  def start_time_must_be_before_end_time
    return if start_time && end_time && start_time.before?(end_time)

    errors.add(:start_time, "must be before end time")
  end

  def must_have_at_least_one_day
    return if PREDICATE_BY_WDAY.any? { |_, predicate| public_send(predicate) }

    errors.add(:base, "must have at least one day")
  end
end
