class AddOwnerColumnsToIntegrations < ActiveRecord::Migration[7.0]
  def up
    add_column :integrations, :owner_id, :bigint, unsigned: true
    add_column :integrations, :owner_type, :string
    change_column :integrations, :organization_id, :bigint, unsigned: true, null: true
    add_index :integrations, [:owner_id, :owner_type]
  end

  def down
    remove_column :integrations, :owner_id, :bigint, unsigned: true
    remove_column :integrations, :owner_type, :string
    change_column :integrations, :organization_id, :bigint, unsigned: true, null: false
    remove_index :integrations, [:owner_id, :owner_type]
  end
end
