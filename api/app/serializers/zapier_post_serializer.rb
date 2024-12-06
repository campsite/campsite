# frozen_string_literal: true

class ZapierPostSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :title do |post|
    post.title.presence || post.title_from_description.presence || ""
  end
  api_field :created_at
  api_field :published_at, nullable: true
  api_field :url
  api_field :description_html, default: "", name: :content
  api_field :project_id do |post|
    post.project&.public_id
  end
end
