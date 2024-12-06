# frozen_string_literal: true

class V2MessagePageSerializer < ApiSerializer
  api_page V2MessageSerializer
  api_field :total_count, type: :number
end
