class AddPersonalColumnToProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :projects, :personal, :boolean, default: false
    add_index :projects, [:creator_id, :organization_id, :personal]
  end
end
