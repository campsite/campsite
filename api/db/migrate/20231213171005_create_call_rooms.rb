class CreateCallRooms < ActiveRecord::Migration[7.1]
  def change
    create_table :call_rooms, id: { type: :bigint, unsigned: true } do |t|
      t.references :subject, polymorphic: true, null: false
      t.string :remote_room_id, null: false

      t.timestamps
    end
    add_index :call_rooms, :remote_room_id
  end
end
