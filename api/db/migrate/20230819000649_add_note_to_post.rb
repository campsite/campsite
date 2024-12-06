class AddNoteToPost < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :note, :boolean, default: false
  end
end
