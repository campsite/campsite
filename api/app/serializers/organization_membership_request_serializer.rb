# frozen_string_literal: true

class OrganizationMembershipRequestSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :created_at
  api_field :organization_slug
  api_association :user, blueprint: UserSerializer
end
