class AddPublicIdToCallRooms < ActiveRecord::Migration[7.1]
  def change
    add_column :call_rooms, :public_id, :string, limit: 12
    add_index :call_rooms, :public_id, unique: true
  end
end
