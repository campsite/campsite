# frozen_string_literal: true

class UserSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :avatar_url
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :cover_photo_url, nullable: true
  api_field :email
  api_field :username
  api_field :display_name
  api_field :system?, name: :system, type: :boolean
  api_field :integration?, name: :integration, type: :boolean
  api_field :notifications_paused?, name: :notifications_paused, type: :boolean
  api_field :notification_pause_expires_at, nullable: true
  api_field :preferred_timezone, name: :timezone, nullable: true
  api_field :logged_in, type: :boolean do |user|
    !user.is_a?(User::NullUser)
  end

  api_normalize "user"
end
