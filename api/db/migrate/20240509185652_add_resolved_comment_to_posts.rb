class AddResolvedCommentToPosts < ActiveRecord::Migration[7.1]
  def change
    add_column :posts, :resolved_comment_id, :bigint, unsigned: true

    add_index :posts, :resolved_comment_id
  end
end
