# frozen_string_literal: true

class PublicOrganizationSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :avatar_url
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :name
  api_field :slug

  api_field :viewer_is_admin, type: :boolean do |org, options|
    next false unless options[:user]

    org.admin?(options[:user])
  end

  api_field :viewer_can_leave, type: :boolean do |org, options|
    next false unless options[:user]

    !org.admin?(options[:user]) || org.admins.size > 1
  end
end
