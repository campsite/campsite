# frozen_string_literal: true

class OrganizationInvitationSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :email
  api_field :role

  api_field :expired?, name: :expired, nullable: true, type: :boolean

  api_association :organization, blueprint: OrganizationInvitationOrgPartialSerializer, view: :with_organization do |invitation|
    invitation.organization
  end

  api_association :projects, blueprint: SimpleProjectSerializer, is_array: true

  api_field :invite_token, name: :token, view: :with_token

  view :owner do
    include_view :with_organization
    include_view :with_token
  end
end
