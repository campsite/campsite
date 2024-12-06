class AddPostParentIdIndex < ActiveRecord::Migration[7.0]
  def change
    add_index(:posts, :parent_id)
  end
end
