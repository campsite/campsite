# frozen_string_literal: true

class ProcessEventJob < BaseJob
  sidekiq_options queue: "default"

  def perform(event_id)
    event = Event.find(event_id)
    return if event.processed?

    event.process!
  end
end
