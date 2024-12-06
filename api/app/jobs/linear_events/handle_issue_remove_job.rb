# frozen_string_literal: true

module LinearEvents
  class HandleIssueRemoveJob < BaseJob
    attr_reader :event

    sidekiq_options queue: "background"

    def perform(payload)
      @event = RemoveIssue.new(JSON.parse(payload))
      ExternalRecord.find_by(service: "linear", remote_record_id: event.issue_id)&.destroy!
    end
  end
end
