# frozen_string_literal: true

class CallRecordingSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :url, nullable: true
  api_field :file_path, nullable: true
  api_field :name, nullable: true
  api_field :file_type, nullable: true
  api_field :imgix_video_thumbnail_preview_url, nullable: true
  api_field :size, type: :number, nullable: true
  api_field :duration, type: :number, nullable: true
  api_field :max_width, type: :number, nullable: true
  api_field :max_height, type: :number, nullable: true
  api_field :transcription_status, enum: CallRecording::TRANSCRIPTION_STATUSES
end
