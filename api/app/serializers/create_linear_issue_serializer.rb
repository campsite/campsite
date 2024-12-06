# frozen_string_literal: true

class CreateLinearIssueSerializer < ApiSerializer
  SUCCESS = "success"
  FAILED = "failed"
  PENDING = "pending"

  api_field :status, enum: [PENDING, FAILED, SUCCESS]

  api_association :external_record, blueprint: ExternalRecordSerializer, nullable: true
end
