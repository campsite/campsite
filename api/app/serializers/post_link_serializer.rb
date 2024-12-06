# frozen_string_literal: true

class PostLinkSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :url
end
