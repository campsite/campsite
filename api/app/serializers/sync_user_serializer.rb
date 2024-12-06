# frozen_string_literal: true

class SyncUserSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :display_name
  api_field :username
  api_field :email
  api_field :integration?, name: :integration, type: :boolean
  api_field :notifications_paused?, name: :notifications_paused, type: :boolean
end
