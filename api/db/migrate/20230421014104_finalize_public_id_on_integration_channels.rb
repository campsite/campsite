class FinalizePublicIdOnIntegrationChannels < ActiveRecord::Migration[7.0]
  def up
    change_column :integration_channels, :public_id, :string, limit: 12, null: false
    add_index :integration_channels, :public_id, unique: true
  end

  def down
    change_column :integration_channels, :public_id, :string, limit: 12, null: true
    remove_index :integration_channels, :public_id, if_exists: true
  end
end
