# frozen_string_literal: true

class V2PostPageSerializer < ApiSerializer
  api_page V2PostSerializer
  api_field :total_count, type: :number
end
