# frozen_string_literal: true

class CreateHmsCallRoomJob < BaseJob
  sidekiq_options queue: "critical", retry: 3

  def perform(call_room_id)
    CallRoom.find(call_room_id).create_hms_call_room!
  end
end
