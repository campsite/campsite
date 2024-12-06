class AddEventTypesToWebhooks < ActiveRecord::Migration[7.2]
  def change
    add_column :webhooks, :event_types, :json
  end
end
