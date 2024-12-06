# frozen_string_literal: true

class LinearLabelSerializer < ApiSerializer
  api_field :id
  api_field :name
  api_field :color

  api_field :parent_name, nullable: true do |label|
    label[:parent]&.[](:name)
  end
end
