# frozen_string_literal: true

class TagPageSerializer < ApiSerializer
  api_page TagSerializer
  api_field :total_count, type: :number
end
