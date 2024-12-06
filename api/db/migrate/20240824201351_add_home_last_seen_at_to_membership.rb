class AddHomeLastSeenAtToMembership < ActiveRecord::Migration[7.2]
  def change
    add_column :organization_memberships, :home_last_seen_at, :datetime
    add_column :organization_memberships, :activity_last_seen_at, :datetime
    add_index :organization_memberships, :home_last_seen_at
    add_index :organization_memberships, :activity_last_seen_at
  end
end
