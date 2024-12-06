class DropSignatureFromWebhookEvents < ActiveRecord::Migration[7.2]
  def change
    remove_column :webhook_events, :signature, :string
  end
end
