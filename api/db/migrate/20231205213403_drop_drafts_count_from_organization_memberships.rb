class DropDraftsCountFromOrganizationMemberships < ActiveRecord::Migration[7.1]
  def change
    remove_column :organization_memberships, :drafts_count, :integer, default: 0, null: false
  end
end
