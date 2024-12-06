# frozen_string_literal: true

class CallHealthJob < BaseJob
  PERMITTED_PROCESSING_TIME = 2.hours

  sidekiq_options queue: "background"

  def perform
    # Job runs once an hour, so look back at a 1-hour window of calls that should be processed by now
    calls = Call.joins(:recordings)
      .where(stopped_at: (PERMITTED_PROCESSING_TIME + 1.hour).ago..PERMITTED_PROCESSING_TIME.ago)
      .where("TIMESTAMPDIFF(SECOND, call_recordings.started_at, call_recordings.stopped_at) > 60 OR call_recordings.stopped_at IS NULL")

    calls
      .where(call_recordings: { file_path: nil })
      .find_each do |call|
      capture_message(message: "Call missing recording", call: call)
    end

    calls
      .where(call_recordings: { transcription_succeeded_at: nil })
      .where.not(call_recordings: { transcription_started_at: nil })
      .find_each do |call|
      capture_message(message: "Call missing transcript", call: call)
    end

    calls
      .where(summary: nil)
      .where.not(call_recordings: { transcription_vtt: nil })
      .find_each do |call|
      capture_message(message: "Call missing summary", call: call)
    end
  end

  private

  def capture_message(message:, call:)
    Sentry.capture_message(message, extra: { org_slug: call.organization.slug, hms_session_url: call.hms_session_url })
  end
end
