class AddLastActivityAtToNotes < ActiveRecord::Migration[7.1]
  def change
    add_column :notes, :last_activity_at, :datetime
    add_index :notes, :last_activity_at
  end
end
