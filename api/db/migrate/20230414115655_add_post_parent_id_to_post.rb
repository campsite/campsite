class AddPostParentIdToPost < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :post_parent_id, :bigint, unsigned: true

    add_index :posts, :post_parent_id
  end
end
