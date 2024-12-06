# frozen_string_literal: true

class V2AuthorSerializer < ApiSerializer
  APP_TYPE = "app"
  MEMBER_TYPE = "member"

  api_field :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :display_name, name: :name
  api_field :public_id, name: :id

  api_field :type, enum: [APP_TYPE, MEMBER_TYPE] do |author|
    author&.application? ? APP_TYPE : MEMBER_TYPE
  end
end
