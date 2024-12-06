class ChangeWebhookIntegrationProviderType < ActiveRecord::Migration[7.1]
  def change
    change_column :webhook_integrations, :provider, :integer, null: false, default: 0
  end
end
