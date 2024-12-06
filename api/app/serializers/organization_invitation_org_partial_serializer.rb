# frozen_string_literal: true

class OrganizationInvitationOrgPartialSerializer < ApiSerializer
  api_field :avatar_url
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :name
  api_field :slug
end
