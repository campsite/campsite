# frozen_string_literal: true

class OpenGraphLinkSerializer < ApiSerializer
  api_field :url
  api_field :title
  api_field :image_url, nullable: true
  api_field :favicon_url, nullable: true
end
