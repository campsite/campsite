# frozen_string_literal: true

class ExternalRecordSerializer < ApiSerializer
  class LinearIssueState < ApiSerializer
    # https://studio.apollographql.com/public/Linear-API/variant/current/schema/reference/objects/WorkflowState?query=type
    LINEAR_ISSUE_STATE_TYPES = [
      :triage, :backlog, :unstarted, :started, :completed, :canceled,
    ].freeze

    api_field :name
    api_field :type, enum: LINEAR_ISSUE_STATE_TYPES
    api_field :color
  end

  api_field :created_at
  api_field :remote_record_id
  api_field :remote_record_title
  api_field :remote_record_url
  api_field :service
  api_field :type
  api_field :linear_issue_identifier
  api_field :linear_issue_state, blueprint: LinearIssueState

  # deprecated
  api_field :linear_identifier do |external_record|
    external_record.linear_issue_identifier
  end
  api_field :linear_state, blueprint: LinearIssueState do |external_record|
    external_record.linear_issue_state
  end
end
