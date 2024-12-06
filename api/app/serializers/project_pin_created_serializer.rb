# frozen_string_literal: true

class ProjectPinCreatedSerializer < ApiSerializer
  api_association :pin, blueprint: ProjectPinSerializer
end
