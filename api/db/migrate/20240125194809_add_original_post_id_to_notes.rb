class AddOriginalPostIdToNotes < ActiveRecord::Migration[7.1]
  def change
    add_column :notes, :original_post_id, :bigint, unsigned: true, null: true
  end
end
