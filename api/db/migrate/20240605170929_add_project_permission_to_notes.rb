class AddProjectPermissionToNotes < ActiveRecord::Migration[7.1]
  def change
    add_column :notes, :project_permission, :integer, default: 0, null: false
  end
end
