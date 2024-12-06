# frozen_string_literal: true

class StopCallRecordingJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(call_id)
    call = Call.find(call_id)
    hms_client = HmsClient.new(app_access_key: Rails.application.credentials.hms.app_access_key, app_secret: Rails.application.credentials.hms.app_secret)
    hms_client.stop_recording_for_room(call.remote_room_id)
  rescue Faraday::BadRequestError => e
    Rails.logger.info("[StopCallRecordingJob] Error stopping recording for room #{call.remote_room_id}: #{e.response_body}")
  rescue Faraday::ResourceNotFound
    Rails.logger.info("[StopCallRecordingJob] No active recording for room #{call.remote_room_id}")
  end
end
