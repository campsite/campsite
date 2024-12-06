# frozen_string_literal: true

module LinearEvents
  class HandleCreateCommentReferenceJob < BaseJob
    attr_reader :event

    sidekiq_options queue: "background"

    def perform(payload)
      @event = CreateComment.new(JSON.parse(payload))

      return unless event.contains_references_from_organization?
      return unless event.associated_integration

      linear_client = LinearClient.new(event.associated_integration.token)

      issue = linear_client.issues.get(id: event.issue_id)

      issue_external_record = ExternalRecord.find_or_initialize_by(
        service: "linear",
        remote_record_id: event.issue_id,
      )

      issue_external_record.assign_attributes(
        remote_record_title: issue["title"],
        metadata: {
          type: CreateIssue::TYPE,
          url: issue["url"],
          identifier: issue["identifier"],
          description: issue["description"],
          state: issue["state"],
        },
      )

      issue_external_record.save!

      comment_external_record = ExternalRecord.find_or_initialize_by(
        service: "linear",
        remote_record_id: event.comment_id,
      )

      comment_external_record.assign_attributes(
        parent: issue_external_record,
        remote_record_title: "#{event.issue_title} (Comment)",
        metadata: {
          type: CreateComment::TYPE,
          url: event.comment_url,
          body: event.comment_body,
        },
      )

      comment_external_record.save!

      comment_external_record.create_post_references
    end
  end
end
