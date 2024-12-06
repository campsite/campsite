# frozen_string_literal: true

FactoryBot.define do
  factory :scheduled_notification do
    schedulable { |f| f.association(:user) }
    delivery_day { "friday" }
    delivery_time { "9:00 am" }
    name { ScheduledNotification::WEEKLY_DIGEST }
    time_zone { "UTC" }
    delivery_offset { nil }

    trait :daily do
      name { ScheduledNotification::DAILY_DIGEST }
    end
  end
end
