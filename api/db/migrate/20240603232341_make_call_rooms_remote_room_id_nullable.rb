class MakeCallRoomsRemoteRoomIdNullable < ActiveRecord::Migration[7.1]
  def up
    change_column :call_rooms, :remote_room_id, :string, null: true
  end

  def down
    change_column :call_rooms, :remote_room_id, :string, null: false
  end
end
