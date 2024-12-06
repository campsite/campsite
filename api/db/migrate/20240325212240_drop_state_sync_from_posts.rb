class DropStateSyncFromPosts < ActiveRecord::Migration[7.1]
  def change
    remove_column :posts, :description_state
    remove_column :posts, :description_schema_version
  end
end
