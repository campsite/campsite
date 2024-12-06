class AddLastSeenAtToOrganizationMemberships < ActiveRecord::Migration[7.0]
  def change
    add_column :organization_memberships, :last_seen_at, :datetime
    add_index :organization_memberships, [:discarded_at, :last_seen_at, :organization_id], name: "idx_memberships_on_discarded_last_seen_and_org"
  end
end
