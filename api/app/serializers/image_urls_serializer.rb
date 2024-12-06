# frozen_string_literal: true

class ImageUrlsSerializer < ApiSerializer
  api_field :original_url
  api_field :thumbnail_url
  api_field :feed_url
  api_field :email_url
  api_field :slack_url
  api_field :large_url
end
