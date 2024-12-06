class AddNoteHighlightToComment < ActiveRecord::Migration[7.0]
  def change
    add_column :post_comments, :note_highlight, :text
  end
end
