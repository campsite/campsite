class AddPositionToOrganizationMembership < ActiveRecord::Migration[7.1]
  def change
    add_column :organization_memberships, :position, :integer
  end
end
