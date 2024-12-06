# frozen_string_literal: true

class NotificationTargetSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :api_type_name, name: :type
  api_field :notification_target_title, name: :title
  api_association :project, blueprint: MiniProjectSerializer, nullable: true do |target|
    target.try(:project)
  end
  api_field :resolved, type: :boolean do |target|
    !!target.try(:resolved?)
  end
end
