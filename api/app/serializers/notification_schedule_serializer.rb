# frozen_string_literal: true

class NotificationScheduleSerializer < ApiSerializer
  api_field :type, enum: ["none", "custom"]
  api_association :custom, blueprint: CustomNotificationScheduleSerializer, nullable: true
end
