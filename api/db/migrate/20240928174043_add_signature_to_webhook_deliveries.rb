class AddSignatureToWebhookDeliveries < ActiveRecord::Migration[7.2]
  def change
    add_column :webhook_deliveries, :signature, :string, null: true
  end
end
