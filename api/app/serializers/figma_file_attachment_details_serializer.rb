# frozen_string_literal: true

class FigmaFileAttachmentDetailsSerializer < ApiSerializer
  api_field :file_path
  api_field :width, type: :number
  api_field :height, type: :number
  api_field :size, type: :number
  api_field :file_type
  api_field :figma_file_id, type: :number
  api_field :remote_figma_node_id
  api_field :remote_figma_node_type
  api_field :remote_figma_node_name
  api_field :figma_share_url

  api_association :image_urls, blueprint: ImageUrlsSerializer
end
