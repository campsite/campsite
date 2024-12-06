class ChangeWebhookEventSignatureNullable < ActiveRecord::Migration[7.2]
  def change
    change_column_null :webhook_events, :signature, true
  end
end
