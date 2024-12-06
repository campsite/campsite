# frozen_string_literal: true

module LinearEvents
  class HandleIssueUpdateJob < BaseJob
    attr_reader :event

    sidekiq_options queue: "background"

    def perform(payload)
      @event = UpdateIssue.new(JSON.parse(payload))
      ExternalRecord.find_by(service: "linear", remote_record_id: event.issue_id)&.update!(
        remote_record_title: event.issue_title,
        metadata: {
          type: CreateIssue::TYPE,
          url: event.issue_url,
          identifier: event.issue_identifier,
          description: event.issue_description,
          state: event.issue_state,
        },
      )
    end
  end
end
