# frozen_string_literal: true

require "csv"

class ProcessCallRecordingChatJob < BaseJob
  sidekiq_options queue: "background"

  def perform(call_recording_id)
    call_recording = CallRecording.find(call_recording_id)

    if call_recording.chat_url
      csv = CSV.parse(Down.download(call_recording.chat_url).read, headers: true)

      if csv.present?
        csv.each do |row|
          urls = row["Message"].scan(%r{\bhttps?://[\S]+})

          urls.each do |url|
            call_recording.chat_links.create!(
              url: url,
              sender_remote_peer_id: row["SenderPeerID"],
              sender_name: row["SenderName"],
              sent_at: Time.zone.parse(row["SentAt"]),
              message: row["Message"],
              remote_message_id: row["MessageID"],
            )
          end
        end
      end
    end
  end
end
