# frozen_string_literal: true

class SummaryBlockSerializer < ApiSerializer
  api_field :text, type: :object, required: false, properties: {
    content: { type: :string },
    bold: { type: :boolean, required: false },
    nowrap: { type: :boolean, required: false },
  }
  api_field :img, type: :object, required: false, properties: {
    src: { type: :string },
    alt: { type: :string },
  }
end
