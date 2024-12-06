# frozen_string_literal: true

class GenerateCallRecordingSummarySectionJob < BaseJob
  sidekiq_options queue: "background", retry: 5

  sidekiq_retries_exhausted do |msg|
    section = CallRecordingSummarySection.find(msg["args"].first)
    section.update!(status: :failed)
    Sentry.capture_message("GenerateCallRecordingSummarySectionJob retries failed", extra: { section_id: section.id })
  end

  def perform(id)
    section = CallRecordingSummarySection.eager_load(call_recording: [:call, speakers: :call_peer]).find(id)

    system_prompt = section.system_prompt
    user_prompt = section.call_recording.formatted_transcript

    section.update!(prompt: system_prompt)

    chat_response = Llm.new.chat(messages: [
      { role: "system", content: system_prompt },
      { role: "user", content: user_prompt },
    ])

    html = StyledText.new(Rails.application.credentials.dig(:styled_text_api, :authtoken))
      .markdown_to_html(markdown: chat_response, editor: "markdown")

    section.update!(response: html, status: :success)

    maybe_trigger_finished(section)
  end

  private

  def maybe_trigger_finished(section)
    if section.call_recording.summary_sections.all?(&:success?)
      call = section.call_recording.call
      call.update_summary_from_recordings! if call.summary.blank?
      call.trigger_stale
      call.reindex(mode: :async)
    end
  end
end
