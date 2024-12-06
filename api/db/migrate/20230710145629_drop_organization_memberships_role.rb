class DropOrganizationMembershipsRole < ActiveRecord::Migration[7.0]
  def change
    remove_column :organization_memberships, :role, :string, null: true
  end
end
