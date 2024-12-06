class AddDraftsCountToOrganizationMemberships < ActiveRecord::Migration[7.0]
  def change
    add_column :organization_memberships, :drafts_count, :integer, null: false, default: 0
  end
end
