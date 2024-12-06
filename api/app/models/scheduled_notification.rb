# frozen_string_literal: true

class ScheduledNotification < ApplicationRecord
  include PublicIdGenerator

  WEEKLY_DIGEST = "weekly_digest"
  DAILY_DIGEST = "daily_digest"
  NAMES = [DAILY_DIGEST, WEEKLY_DIGEST]

  belongs_to :schedulable, polymorphic: true

  validates :delivery_time, :time_zone, presence: true
  validates :name, inclusion: { in: NAMES, list: NAMES }

  validate :timezone_exists

  enum :delivery_day,
    {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    }

  scope :post_digests, -> { where(name: [DAILY_DIGEST, WEEKLY_DIGEST]) }

  scope :schedulable_in, ->(time) do
    get_offset = "IFNULL(scheduled_notifications.delivery_offset, 0)"

    min_dt = "CONVERT_TZ(:now, 'UTC', scheduled_notifications.time_zone) - INTERVAL #{get_offset} SECOND"
    max_dt = "CONVERT_TZ(:end, 'UTC', scheduled_notifications.time_zone) - INTERVAL #{get_offset} SECOND"
    delivery_time = "TIME(scheduled_notifications.delivery_time)"

    sql = <<~SQL.squish
      (
        DATE(#{min_dt}) = DATE(#{max_dt})
        AND (
          scheduled_notifications.delivery_day IS NULL
          OR scheduled_notifications.delivery_day = DAYOFWEEK(#{min_dt}) - 1
        )
        AND (#{delivery_time}) BETWEEN TIME(#{min_dt}) AND TIME(#{max_dt})
      )
      /*
        When range starts on one day and ends on the next day, notification is schedulable when:
        1. delivery_time is today after now, or
        2. delivery_time is tomorrow before end
      */
      OR (
        DATEDIFF(DATE(#{max_dt}), DATE(#{min_dt})) = 1
        AND (
          (
            (
              scheduled_notifications.delivery_day IS NULL
              OR scheduled_notifications.delivery_day = DAYOFWEEK(#{min_dt}) - 1
            )
            AND (#{delivery_time}) >= TIME(#{min_dt})
          )
          OR (
            (
              scheduled_notifications.delivery_day IS NULL
              OR scheduled_notifications.delivery_day = DAYOFWEEK(#{max_dt}) - 1
            )
            AND (#{delivery_time}) <= TIME(#{max_dt})
          )
        )
      )
    SQL

    now = Time.current
    where(sql, { now: now, end: time.from_now.in_time_zone })
  end

  def weekly_digest?
    name == WEEKLY_DIGEST
  end

  def daily_digest?
    name == DAILY_DIGEST
  end

  def display_name
    name.humanize.capitalize
  end

  def api_type_name
    "ScheduledNotification"
  end

  def formatted_delivery_time
    # formats delivery time to eg. 9:00 am
    delivery_time.strftime("%l:%M %P").strip
  end

  private

  def timezone_exists
    return unless time_zone
    return if TZInfo::Timezone.all_identifiers.include?(time_zone)

    errors.add(:time_zone, "does not exist")
  end
end
