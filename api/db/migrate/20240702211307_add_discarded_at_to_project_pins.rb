class AddDiscardedAtToProjectPins < ActiveRecord::Migration[7.1]
  def change
    add_column :project_pins, :discarded_at, :datetime
    add_index :project_pins, :discarded_at
  end
end
