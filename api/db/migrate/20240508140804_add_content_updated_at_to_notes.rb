class AddContentUpdatedAtToNotes < ActiveRecord::Migration[7.1]
  def change
    add_column :notes, :content_updated_at, :datetime
    add_index :notes, :content_updated_at
  end
end
