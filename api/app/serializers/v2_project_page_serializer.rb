# frozen_string_literal: true

class V2ProjectPageSerializer < ApiSerializer
  api_page V2ProjectSerializer
  api_field :total_count, type: :number
end
