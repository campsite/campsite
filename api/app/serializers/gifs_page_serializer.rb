# frozen_string_literal: true

class GifsPageSerializer < ApiSerializer
  class GifSerializer < ApiSerializer
    api_field :id, type: :string
    api_field :description, type: :string
    api_field :url, type: :string
    api_field :width, type: :number
    api_field :height, type: :number
  end

  api_association :data, blueprint: GifSerializer, is_array: true
  api_field :next_cursor, type: :string
end
