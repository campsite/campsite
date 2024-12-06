class AddIntegrationChannelsIndex < ActiveRecord::Migration[7.0]
  def change
    add_index :integration_channels, [:integration_id, :provider_channel_id], unique: true, name: "idx_integration_channels_on_integration_and_provider_channel"
    add_index :integration_channels, :provider_channel_id
  end
end
