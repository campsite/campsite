class DropNotesOrganizationPermission < ActiveRecord::Migration[7.1]
  def change
    remove_column :notes, :organization_permission
  end
end
