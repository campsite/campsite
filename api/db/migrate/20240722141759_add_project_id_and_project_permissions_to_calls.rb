class AddProjectIdAndProjectPermissionsToCalls < ActiveRecord::Migration[7.1]
  def change
    add_column :calls, :project_id, :bigint, unsigned: true
    add_column :calls, :project_permission, :integer, default: 0, null: false
    add_index :calls, :project_id
  end
end
