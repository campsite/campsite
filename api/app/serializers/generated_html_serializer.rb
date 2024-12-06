# frozen_string_literal: true

class GeneratedHtmlSerializer < ApiSerializer
  SUCCESS = "success"
  FAILED = "failed"
  PENDING = "pending"

  api_field :status, enum: [PENDING, FAILED, SUCCESS]
  api_field :html, nullable: true
  api_field :response_id, nullable: true
end
