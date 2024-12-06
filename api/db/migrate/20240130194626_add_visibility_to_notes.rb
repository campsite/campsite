class AddVisibilityToNotes < ActiveRecord::Migration[7.1]
  def change
    add_column :notes, :visibility, :integer, default: 0, null: false
  end
end
