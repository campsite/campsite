class AddWebhookIntegrationIdToPost < ActiveRecord::Migration[7.1]
  def change
    add_reference :posts, :webhook_integration, unsigned: true
  end
end
