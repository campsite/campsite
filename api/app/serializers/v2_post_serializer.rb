# frozen_string_literal: true

class V2PostSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :title do |post|
    post.title.presence || post.title_from_description.presence || ""
  end
  api_field :created_at
  api_field :last_activity_at
  api_field :url
  api_field :description_html, default: "", name: :content
  api_field :comments_count, type: :number
  api_association :project, name: :channel, blueprint: V2ProjectSerializer
  api_association :author, blueprint: V2AuthorSerializer

  api_association :resolution, blueprint: V2PostResolutionSerializer, nullable: true do |post|
    next unless post.resolved?

    {
      resolved_at: post.resolved_at,
      resolved_by: post.resolved_by,
      resolved_html: post.resolved_html,
      resolved_comment: post.resolved_comment,
    }
  end
end
