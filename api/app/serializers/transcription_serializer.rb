# frozen_string_literal: true

class TranscriptionSerializer < ApiSerializer
  api_field :status
  api_field :vtt, nullable: true
end
