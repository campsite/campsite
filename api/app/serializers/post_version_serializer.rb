# frozen_string_literal: true

class PostVersionSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :created_at
  api_field :published_at, nullable: true
  api_field :comments_count, type: :number
  api_field :version, type: :number
end
