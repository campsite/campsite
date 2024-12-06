# frozen_string_literal: true

class SyncOrganizationMemberSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :role_name, name: :role, enum: Role::NAMES
  api_field :deactivated?, name: :deactivated, type: :boolean
  api_field :last_seen_at, nullable: true
  api_association :user, blueprint: SyncUserSerializer
end
