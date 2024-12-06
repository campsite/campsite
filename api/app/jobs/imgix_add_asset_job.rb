# frozen_string_literal: true

class ImgixAddAssetJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(origin_path)
    client = ImgixClient.new(api_key: Rails.application.credentials.dig(:imgix, :api_key))
    client.add_asset(source_id: Rails.application.credentials.dig(:imgix, :source_id), origin_path: origin_path)
  end
end
