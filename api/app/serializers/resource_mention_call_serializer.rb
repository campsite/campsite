# frozen_string_literal: true

class ResourceMentionCallSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :title do |call, options|
    call.formatted_title(options[:member]) || "Untitled call"
  end
  api_field :created_at
  api_field :url do |call, options|
    call.url(options[:organization])
  end
end
