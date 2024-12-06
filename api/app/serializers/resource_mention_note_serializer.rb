# frozen_string_literal: true

class ResourceMentionNoteSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :title
  api_field :created_at
  api_field :url do |post, options|
    post.url(options[:organization])
  end
end
