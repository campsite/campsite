# frozen_string_literal: true

class V2CommentPageSerializer < ApiSerializer
  api_page V2CommentSerializer
  api_field :total_count, type: :number
end
