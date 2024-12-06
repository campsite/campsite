class MakeWebhookEventTypesNonNullable < ActiveRecord::Migration[7.2]
  def change
    change_column_null :webhooks, :event_types, false
  end
end
