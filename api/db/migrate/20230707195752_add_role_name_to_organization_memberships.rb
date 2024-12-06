class AddRoleNameToOrganizationMemberships < ActiveRecord::Migration[7.0]
  def change
    add_column :organization_memberships, :role_name, :string, null: false, default: "viewer"
    add_index :organization_memberships, :role_name
  end
end
