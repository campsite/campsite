# frozen_string_literal: true

module HmsEvents
  class HandleSessionOpenSuccessJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = SessionOpenSuccessEvent.new(JSON.parse(payload))

      Call.create_or_find_by_hms_event!(event)
    end
  end
end
