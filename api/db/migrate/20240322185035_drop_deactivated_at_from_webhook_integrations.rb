class DropDeactivatedAtFromWebhookIntegrations < ActiveRecord::Migration[7.1]
  def change
    remove_column :webhook_integrations, :deactivated_at, :datetime if column_exists?(:webhook_integrations, :deactivated_at)
  end
end
