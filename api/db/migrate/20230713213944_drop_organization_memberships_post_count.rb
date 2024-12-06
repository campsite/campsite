class DropOrganizationMembershipsPostCount < ActiveRecord::Migration[7.0]
  def change
    remove_column :organization_memberships, :posts_count, :integer, default: 0, null: false
  end
end
