# frozen_string_literal: true

class NotificationFollowUpSubjectSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :api_type_name, name: :type
  api_association :viewer_follow_up, blueprint: SubjectFollowUpSerializer, nullable: true
end
