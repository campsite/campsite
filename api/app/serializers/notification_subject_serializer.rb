# frozen_string_literal: true

class NotificationSubjectSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :api_type_name, name: :type
end
