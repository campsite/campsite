# frozen_string_literal: true

module LinearEvents
  class HandleCreateIssueReferenceJob < BaseJob
    attr_reader :event

    sidekiq_options queue: "background"

    def perform(payload)
      @event = CreateIssue.new(JSON.parse(payload))

      return if event.private_team?

      return unless event.contains_references_from_organization?

      external_record = ExternalRecord.find_or_initialize_by(
        service: "linear",
        remote_record_id: event.issue_id,
      )

      external_record.assign_attributes(
        remote_record_title: event.issue_title,
        metadata: {
          type: CreateIssue::TYPE,
          url: event.issue_url,
          identifier: event.issue_identifier,
          description: event.issue_description,
          state: event.issue_state,
        },
      )

      external_record.save!

      external_record.create_post_references
    end
  end
end
