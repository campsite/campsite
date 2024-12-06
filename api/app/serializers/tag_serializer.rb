# frozen_string_literal: true

class TagSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :posts_count, type: :number

  api_field :url do |tag, options|
    tag.url(options[:organization])
  end

  api_field :viewer_can_destroy, type: :boolean do |_tag, options|
    next false unless options[:member]

    options[:member].role_has_permission?(resource: Role::TAG_RESOURCE, permission: Role::DESTROY_ANY_ACTION)
  end
end
