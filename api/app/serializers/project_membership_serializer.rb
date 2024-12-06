# frozen_string_literal: true

class ProjectMembershipSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :position, type: :integer
  api_association :project, blueprint: ProjectSerializer
end
