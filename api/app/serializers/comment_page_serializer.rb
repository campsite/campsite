# frozen_string_literal: true

class CommentPageSerializer < ApiSerializer
  def self.schema_name
    "CommentPage"
  end

  api_page CommentSerializer
  api_field :total_count, type: :number
end
