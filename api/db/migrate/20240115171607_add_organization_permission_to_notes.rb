class AddOrganizationPermissionToNotes < ActiveRecord::Migration[7.1]
  def change
    add_column :notes, :organization_permission, :integer, default: 0, null: false
  end
end
