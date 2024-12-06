# frozen_string_literal: true

class SearchMixedItemSerializer < ApiSerializer
  ITEM_TYPES = [
    :post,
    :call,
    :note,
  ].freeze

  api_field :public_id, name: :id
  api_field :type, enum: ITEM_TYPES

  api_field :highlights, is_array: true do |item|
    next [] unless item[:highlight]

    item[:highlight]
      .reject { |key| key.to_s == "title.analyzed" || !key.to_s.end_with?(".analyzed") }
      .values.flatten
  end

  api_field :title_highlight, type: :string, nullable: true do |item|
    item[:highlight]&.dig("title.analyzed")&.first
  end
end
