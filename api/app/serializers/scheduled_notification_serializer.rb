# frozen_string_literal: true

class ScheduledNotificationSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :time_zone
  api_field :delivery_day, nullable: true
  api_field :formatted_delivery_time, name: :delivery_time
end
