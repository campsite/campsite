class DropIntegrationsOrganizationId < ActiveRecord::Migration[7.0]
  def up
    remove_column :integrations, :organization_id, :bigint, unsigned: true
    change_column :integrations, :owner_id, :bigint, unsigned: true, null: false
    change_column :integrations, :owner_type, :string, null: false
  end
  
  def down
    add_column :integrations, :organization_id, :bigint, unsigned: true
    add_index :integrations, :organization_id
    change_column :integrations, :owner_id, :bigint, unsigned: true, null: true
    change_column :integrations, :owner_type, :string, null: true
  end
end
