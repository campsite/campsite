class AddMoreIndexesToPosts < ActiveRecord::Migration[7.0]
  def change
    add_index :posts, [:organization_id, :discarded_at]
    add_index :posts, [:project_id, :discarded_at]
  end
end
