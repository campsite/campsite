# frozen_string_literal: true

FactoryBot.define do
  factory :notification_schedule do
    user
    start_time { Time.zone.parse("08:00") }
    end_time { Time.zone.parse("20:00") }
  end
end
