# frozen_string_literal: true

class MiniProjectSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :accessory, nullable: true
  api_field :private, type: :boolean
  api_field :archived?, name: :archived, type: :boolean

  api_field :message_thread_id, type: :string, nullable: true do |project|
    project.message_thread&.public_id
  end
end
