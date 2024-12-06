# frozen_string_literal: true

class PostSeoInfoSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :seo_title
  api_field :seo_description
  api_field :open_graph_image_url, nullable: true
  api_field :open_graph_video_url, nullable: true
end
