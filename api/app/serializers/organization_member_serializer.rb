# frozen_string_literal: true

class OrganizationMemberSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :role_name, name: :role, enum: Role::NAMES
  api_field :created_at
  api_field :deactivated?, name: :deactivated, type: :boolean
  api_field :is_organization_member, type: :boolean do |member|
    !member.is_a?(OrganizationMembership::NullOrganizationMembership)
  end

  api_association :user, blueprint: UserSerializer

  api_association :latest_active_status, name: :status, blueprint: OrganizationMembershipStatusSerializer, nullable: true
end
