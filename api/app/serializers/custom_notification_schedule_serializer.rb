# frozen_string_literal: true

class CustomNotificationScheduleSerializer < ApiSerializer
  api_field :days, enum: Date::DAYNAMES, is_array: true
  api_field :start_time_formatted, name: :start_time, type: :string
  api_field :end_time_formatted, name: :end_time, type: :string
end
