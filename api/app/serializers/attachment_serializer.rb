# frozen_string_literal: true

class AttachmentSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :file_type
  api_field :url
  api_field :app_url
  api_field :download_url
  api_field :preview_url, nullable: true
  api_field :preview_thumbnail_url, nullable: true
  api_association :image_urls, blueprint: ImageUrlsSerializer, nullable: true
  api_field :link?, name: :link, type: :boolean
  api_field :image?, name: :image, type: :boolean
  api_field :video?, name: :video, type: :boolean
  api_field :audio?, name: :audio, type: :boolean
  api_field :origami?, name: :origami, type: :boolean
  api_field :principle?, name: :principle, type: :boolean
  api_field :lottie?, name: :lottie, type: :boolean
  api_field :stitch?, name: :stitch, type: :boolean
  api_field :gif?, name: :gif, type: :boolean
  api_field :duration, type: :number, default: 0
  api_field :width, type: :number, default: 0
  api_field :height, type: :number, default: 0
  api_field :subject_type, type: :string, nullable: true
  api_field :name, nullable: true
  api_field :size, type: :number, nullable: true
  api_field :remote_figma_url, nullable: true
  api_field :no_video_track?, name: :no_video_track, type: :boolean, default: false
  api_field :gallery_id, nullable: true

  api_normalize "attachment"

  api_field :subject_id, nullable: true do |attachment|
    attachment.subject&.public_id
  end

  api_field :is_subject_comment, type: :boolean do |attachment|
    attachment.subject&.is_a?(Comment) || false
  end

  api_field :relative_url do |attachment|
    attachment.file_path
  end

  api_field :preview_file_path, name: :preview_relative_url, nullable: true

  api_field :comments_count, type: :number, default: 0

  # client-only fields

  api_field :key, nullable: true do
    nil
  end

  api_field :optimistic_id, nullable: true, required: false do
    nil
  end

  api_field :optimistic_file_path, nullable: true, required: false do
    nil
  end

  api_field :optimistic_preview_file_path, nullable: true, required: false do
    nil
  end

  api_field :optimistic_imgix_video_file_path, nullable: true, required: false do
    nil
  end

  api_field :optimistic_src, nullable: true, required: false do
    nil
  end

  api_field :optimistic_preview_src, nullable: true, required: false do
    nil
  end

  api_field :optimistic_ready, type: :boolean do
    true
  end

  api_field :client_error, nullable: true, required: false do
    nil
  end
end
