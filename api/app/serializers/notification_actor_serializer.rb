# frozen_string_literal: true

class NotificationActorSerializer < ApiSerializer
  api_field :avatar_url
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :username
  api_field :display_name
  api_field :integration?, name: :integration, type: :boolean
end
