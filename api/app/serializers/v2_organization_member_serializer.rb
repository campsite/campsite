# frozen_string_literal: true

class V2OrganizationMemberSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :role_name, name: :role, enum: Role::NAMES
  api_field :created_at
  api_field :deactivated?, name: :is_deactivated, type: :boolean
  api_association :user, blueprint: V2UserSerializer
end
