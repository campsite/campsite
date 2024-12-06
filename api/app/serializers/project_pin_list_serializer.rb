# frozen_string_literal: true

class ProjectPinListSerializer < ApiSerializer
  api_association :data, blueprint: ProjectPinSerializer, is_array: true
end
