class ChangeOrganizationMembershipsRoleToNullable < ActiveRecord::Migration[7.0]
  def up
    change_column :organization_memberships, :role, :string, null: true
  end

  def down
    change_column :organization_memberships, :role, :string, null: false
  end
end
