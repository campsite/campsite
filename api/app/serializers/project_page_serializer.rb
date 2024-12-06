# frozen_string_literal: true

class ProjectPageSerializer < ApiSerializer
  api_page ProjectSerializer
  api_field :total_count, type: :number
end
