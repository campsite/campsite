class MakeCallRoomsSubjectNullable < ActiveRecord::Migration[7.1]
  def up
    change_column :call_rooms, :subject_id, :bigint, unsigned: true, null: true
    change_column :call_rooms, :subject_type, :string, null: true
  end

  def down
    change_column :call_rooms, :subject_id, :bigint, null: false
    change_column :call_rooms, :subject_type, :string, null: false
  end
end
