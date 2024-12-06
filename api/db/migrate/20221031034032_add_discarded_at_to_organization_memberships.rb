class AddDiscardedAtToOrganizationMemberships < ActiveRecord::Migration[7.0]
  def change
    add_column :organization_memberships, :discarded_at, :datetime
    add_index :organization_memberships, :discarded_at
  end
end
