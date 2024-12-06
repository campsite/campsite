# frozen_string_literal: true

class TimelineEventPageSerializer < ApiSerializer
  api_page TimelineEventSerializer
  api_field :total_count, type: :number
end
