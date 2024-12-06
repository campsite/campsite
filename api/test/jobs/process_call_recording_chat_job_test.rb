# frozen_string_literal: true

require "test_helper"

class ProcessCallRecordingChatJobTest < ActiveJob::TestCase
  setup do
    @params = JSON.parse(file_fixture("hms/beam_recording_success_event_payload.json").read)
    @recording = create(:call_recording, chat_file_path: @params.dig("data", "chat_recording_path"))
  end

  describe "#perform" do
    test "creates CallRecordingChatLink records for links in chat" do
      Down.expects(:download).with(@recording.chat_url).returns(file_fixture("hms/chat.csv"))

      assert_difference "CallRecordingChatLink.count", 1 do
        ProcessCallRecordingChatJob.new.perform(@recording.id)
      end

      chat_link = @recording.reload.chat_links.first!
      assert_equal "https://www.recreation.gov/camping/gateways/2782", chat_link.url
      assert_equal "58cde3b7-3db3-4b98-83de-0b75e62dc537", chat_link.sender_remote_peer_id
      assert_equal "Ranger Rick", chat_link.sender_name
      assert_equal Time.zone.parse("2024-08-15T17:39:21Z"), chat_link.sent_at
      assert_equal "Have you seen this cool URL? https://www.recreation.gov/camping/gateways/2782\n\nIt's Joshua Tree National Park.", chat_link.message
      assert_equal "67e0a391-d8fb-4c08-a56e-0c2e6f724bd1", chat_link.remote_message_id
    end
  end
end
