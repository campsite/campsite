# frozen_string_literal: true

class FavoriteSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :position, type: :integer
  api_field :favoritable_type, enum: Favorite::FAVORITABLE_TYPES
  api_field :favoritable_id do |favorite|
    favorite.favoritable.public_id
  end

  api_field :favoritable_accessory, name: :accessory, nullable: true
  api_field :favoritable_name, name: :name do |favorite, opts|
    favorite.favoritable.favoritable_name(opts[:member])
  end
  api_field :url
  api_field :favoritable_private, name: :private, type: :boolean

  api_association :project, blueprint: ProjectSerializer, nullable: true

  api_association :message_thread, blueprint: MessageThreadSerializer, nullable: true
end
