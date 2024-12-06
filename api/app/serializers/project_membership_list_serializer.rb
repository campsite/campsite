# frozen_string_literal: true

class ProjectMembershipListSerializer < ApiSerializer
  api_association :data, blueprint: ProjectMembershipSerializer, is_array: true
end
