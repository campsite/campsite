# frozen_string_literal: true

class CustomReactionsPackSerializer < ApiSerializer
  class CustomReactionsPackItemSerializer < ApiSerializer
    api_field :name, type: :string
    api_field :file_url, type: :string
  end

  api_field :name, enum: CustomReaction.packs.keys
  api_field :installed?, name: :installed, type: :boolean

  api_association :items, blueprint: CustomReactionsPackItemSerializer, is_array: true
end
