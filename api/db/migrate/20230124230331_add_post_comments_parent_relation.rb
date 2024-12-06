class AddPostCommentsParentRelation < ActiveRecord::Migration[7.0]
  def change
    add_column :post_comments, :parent_id, :bigint, unsigned: true, index: true
  end
end
