class AddOrganizationIdToCallRooms < ActiveRecord::Migration[7.1]
  def change
    add_column :call_rooms, :organization_id, :bigint, unsigned: true
    add_index :call_rooms, :organization_id
  end
end
