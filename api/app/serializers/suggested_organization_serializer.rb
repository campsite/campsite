# frozen_string_literal: true

class SuggestedOrganizationSerializer < ApiSerializer
  def self.schema_name
    "SuggestedOrganization"
  end

  api_field :public_id, name: :id

  api_field :avatar_url
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :name
  api_field :slug

  api_field :requested, type: :boolean do |org, options|
    org.requested_membership?(options[:user])
  end

  api_field :joined, required: false, type: :boolean, view: :with_joined do |org, options|
    org.member?(options[:user])
  end
end
