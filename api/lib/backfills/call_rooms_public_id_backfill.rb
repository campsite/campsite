# frozen_string_literal: true

module Backfills
  class CallRoomsPublicIdBackfill
    def self.run(dry_run: true)
      call_rooms = CallRoom.where(public_id: nil)

      count = if dry_run
        call_rooms.count
      else
        result = 0

        call_rooms.find_each do |call_room|
          call_room.update_columns(public_id: CallRoom.generate_public_id)
          result += 1
        end

        result
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} CallRoom #{"record".pluralize(count)}"
    end
  end
end
