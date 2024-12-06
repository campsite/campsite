# frozen_string_literal: true

class CustomReactionPageSerializer < ApiSerializer
  api_page CustomReactionSerializer
  api_field :total_count, type: :number
end
