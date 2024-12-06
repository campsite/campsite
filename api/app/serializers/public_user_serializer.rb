# frozen_string_literal: true

class PublicUserSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :display_name
  api_field :username
end
