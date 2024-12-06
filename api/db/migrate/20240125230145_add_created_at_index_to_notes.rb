class AddCreatedAtIndexToNotes < ActiveRecord::Migration[7.1]
  def change
    add_index :notes, :created_at
  end
end
