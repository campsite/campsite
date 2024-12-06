# frozen_string_literal: true

class GenerateCallTitleJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  sidekiq_retries_exhausted do |msg|
    call = Call.find(msg["args"].first)
    call.update!(generated_title_status: :failed)
  end

  def perform(call_id)
    call = Call.find(call_id)
    title = call.generate_title
    call.update!(generated_title: title, generated_title_status: :completed)
    call.trigger_stale
  end
end
