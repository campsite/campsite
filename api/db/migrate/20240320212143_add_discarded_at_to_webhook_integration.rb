class AddDiscardedAtToWebhookIntegration < ActiveRecord::Migration[7.1]
  def change
    # 20240313230954_create_webhook_tables was deployed with an incorrect schema.
    # it had a `deactivated_at` column instead of `discarded_at`.
    unless column_exists?(:webhook_integrations, :discarded_at)
      execute <<-SQL
        ALTER TABLE webhook_integrations
        ADD COLUMN discarded_at datetime
      SQL

      add_index :webhook_integrations, :discarded_at
    end
  end
end
