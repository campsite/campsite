# frozen_string_literal: true

class V2UserSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :email
  api_field :display_name
end
