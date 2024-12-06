class AddSourceToCallRooms < ActiveRecord::Migration[7.1]
  def change
    add_column :call_rooms, :source, :integer
    add_column :call_rooms, :creator_id, :integer
    add_index :call_rooms, :creator_id
  end
end
