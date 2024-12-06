# frozen_string_literal: true

class SearchPostSerializer < ApiSerializer
  POST_INCLUDES = [
    :attachments,
    :project,
    :integration,
    :oauth_application,
    member: :user,
  ].freeze

  api_field :public_id, name: :id
  api_field :title do |post|
    post.display_title || ""
  end
  api_field :description_html
  api_field :truncated_description_text
  api_field :created_at
  api_field :published_at, nullable: true
  api_field :thumbnail_url, nullable: true

  api_association :author, name: :member, blueprint: OrganizationMemberSerializer
  api_association :project, blueprint: MiniProjectSerializer
end
