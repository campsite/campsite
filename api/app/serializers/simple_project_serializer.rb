# frozen_string_literal: true

class SimpleProjectSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :description, nullable: true
  api_field :created_at
  api_field :archived_at, nullable: true
  api_field :accessory, nullable: true
  api_field :private, type: :boolean
  api_field :is_general, type: :boolean
  api_field :is_default, type: :boolean do |project|
    project.is_default || false
  end
end
