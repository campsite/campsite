# frozen_string_literal: true

class ResourceMentionPostSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :display_title, name: :title
  api_field :created_at
  api_field :published_at, nullable: true
  api_field :url do |post, options|
    post.url(options[:organization])
  end
end
