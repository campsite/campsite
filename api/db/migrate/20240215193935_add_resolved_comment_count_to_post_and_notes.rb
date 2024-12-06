class AddResolvedCommentCountToPostAndNotes < ActiveRecord::Migration[7.1]
  def change
    add_column :posts, :resolved_comments_count, :integer, default: 0
    add_column :notes, :resolved_comments_count, :integer, default: 0
  end
end
