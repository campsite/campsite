class AddMissingIndexesToPostsAndProjects < ActiveRecord::Migration[7.0]
  def change
    add_index :posts, :project_id
    add_index :projects, :organization_id
    add_index :projects, [:organization_id, :archived_at]
  end
end
